const pool = require('../config/database');

class ChecklistController {

    async uploadAnexo(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum ficheiro foi enviado.' });
            }
            const ficheiro = req.file;
            return res.status(201).json({
                message: 'Ficheiro enviado com sucesso!',
                filePath: ficheiro.path
            });
        } catch (error) {
            console.error('Erro no upload do anexo:', error);
            return res.status(500).json({ error: 'Falha no upload do anexo.' });
        }
    }

    async salvarRegistro(req, res) {
        let connection;
        try {
            connection = await pool.getConnection();
            const { template_id, colaborador_id, ativo_relacionado_id, respostas, filePaths } = req.body;

            // Validações de entrada
            if (!template_id) {
                return res.status(400).json({ error: 'O campo template_id é obrigatório.' });
            }
            const templateIdNum = parseInt(template_id, 10);
            if (isNaN(templateIdNum)) {
                return res.status(400).json({ error: 'template_id inválido.' });
            }

            if (colaborador_id === undefined || colaborador_id === null) {
                return res.status(400).json({ error: 'O campo colaborador_id é obrigatório.' });
            }
            const colaboradorIdNum = parseInt(colaborador_id, 10);
            if (isNaN(colaboradorIdNum)) {
                return res.status(400).json({ error: 'colaborador_id inválido.' });
            }

            // Verifica se o colaborador existe (evita erro de foreign key)
            const [colRows] = await connection.query('SELECT id FROM colaborador WHERE id = ?', [colaboradorIdNum]);
            if (!colRows || colRows.length === 0) {
                return res.status(400).json({ error: `Colaborador com id ${colaboradorIdNum} não encontrado.` });
            }

            await connection.beginTransaction();

            const registoQuery = 'INSERT INTO registros_checklist (template_id, colaborador_id, ativo_relacionado_id) VALUES (?, ?, ?)';
            const [registoResult] = await connection.execute(registoQuery, [templateIdNum, colaboradorIdNum, ativo_relacionado_id || null]);
            const novoRegistoId = registoResult.insertId;

            if (respostas && respostas.length > 0) {
                // Resolve pergunta_id: aceita payload com pergunta_id (DB id) ou pergunta_texto/tipo_pergunta
                const resolvedValues = [];
                for (const r of respostas) {
                    let perguntaIdDb = null;
                    // If a numeric pergunta_id was provided, check it exists
                    if (r.pergunta_id) {
                        const pid = parseInt(r.pergunta_id, 10);
                        if (!isNaN(pid)) {
                            const [rows] = await connection.query('SELECT id FROM checklist_perguntas WHERE id = ?', [pid]);
                            if (rows && rows.length > 0) perguntaIdDb = pid;
                        }
                    }

                    // Try to resolve by texto if not found
                    if (!perguntaIdDb && r.pergunta_texto) {
                        const [rows2] = await connection.query('SELECT id FROM checklist_perguntas WHERE texto_pergunta = ? LIMIT 1', [r.pergunta_texto]);
                        if (rows2 && rows2.length > 0) {
                            perguntaIdDb = rows2[0].id;
                        } else {
                            // Insert new pergunta record (default tipo_pergunta if not provided)
                            const tipo = r.tipo_pergunta || 'TEXTO';
                            const [ins] = await connection.query('INSERT INTO checklist_perguntas (texto_pergunta, tipo_pergunta, ativo) VALUES (?, ?, ?)', [r.pergunta_texto, tipo, true]);
                            perguntaIdDb = ins.insertId;
                        }
                    }

                    // As a last resort, if still no pergunta id, throw a helpful error
                    if (!perguntaIdDb) {
                        throw new Error(`Pergunta não encontrada e não foi possível criar (pergunta_temp_id=${r.pergunta_temp_id})`);
                    }

                    resolvedValues.push([novoRegistoId, perguntaIdDb, r.valor_resposta]);
                }

                if (resolvedValues.length > 0) {
                    const respostasQuery = 'INSERT INTO checklist_respostas (registro_id, pergunta_id, valor_resposta) VALUES ?';
                    await connection.query(respostasQuery, [resolvedValues]);
                }
            }

            if (filePaths && filePaths.length > 0) {
                const anexosQuery = 'INSERT INTO registros_anexos (registro_id, caminho_arquivo) VALUES ?';
                const anexosValues = filePaths.map(path => [novoRegistoId, path]);
                await connection.query(anexosQuery, [anexosValues]);
            }

            await connection.commit();
            return res.status(201).json({ message: 'Checklist guardado com sucesso!', registoId: novoRegistoId });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Erro ao guardar checklist. Transação desfeita.', error);
            return res.status(500).json({ error: 'Falha ao guardar o checklist.' });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async listarRespostas(req, res) {
        console.log("\n--- DEBUG: A função listarRespostas foi chamada ---");
        const { templateId } = req.query;
        console.log("DEBUG: templateId recebido da URL:", templateId);

        if (!templateId) {
            return res.status(400).json({ message: 'O ID do template é obrigatório.' });
        }

        const idNumerico = parseInt(templateId, 10);
        console.log("DEBUG: idNumerico após parseInt:", idNumerico);

        if (isNaN(idNumerico)) {
            return res.status(400).json({ message: 'O ID do template deve ser um número.' });
        }

        let connection;
        try {
            connection = await pool.getConnection();

            // CORREÇÃO: Fazer JOIN com a tabela de perguntas para pegar o texto_pergunta
            // AJUSTE O NOME DA TABELA SE FOR DIFERENTE
            const sql = `
      SELECT 
        r.id as registro_id,
        r.template_id,
        r.colaborador_id,
        r.ativo_relacionado_id,
        r.data_envio,
        cr.id as resposta_id,
        cr.pergunta_id,
        cr.valor_resposta,
        p.texto_pergunta,
        p.tipo_pergunta
      FROM registros_checklist r
      LEFT JOIN checklist_respostas cr ON r.id = cr.registro_id
      LEFT JOIN checklist_perguntas p ON cr.pergunta_id = p.id
      WHERE r.template_id = ?
      ORDER BY r.data_envio DESC, cr.pergunta_id ASC
    `;

            console.log("DEBUG: Executando query SQL:", sql);
            console.log("DEBUG: Com valor:", [idNumerico]);

            const [rows] = await connection.query(sql, [idNumerico]);
            console.log("DEBUG: Resultado da busca (rows):", rows);

            // Agrupar respostas por registro
            const registrosAgrupados = {};

            rows.forEach(row => {
                const registroId = row.registro_id;

                if (!registrosAgrupados[registroId]) {
                    registrosAgrupados[registroId] = {
                        registro_id: registroId,
                        data_envio: row.data_envio,
                        template_id: row.template_id,
                        colaborador_id: row.colaborador_id,
                        ativo_relacionado_id: row.ativo_relacionado_id
                    };
                }

                // Adicionar a resposta usando o TEXTO DA PERGUNTA como nome da coluna
                if (row.texto_pergunta && row.valor_resposta !== null) {
                    registrosAgrupados[registroId][row.texto_pergunta] = row.valor_resposta;
                }
            });

            // Converter objeto em array
            const resultado = Object.values(registrosAgrupados);

            console.log("DEBUG: Dados formatados para envio:", resultado);

            res.status(200).json(resultado);

        } catch (error) {
            console.error(`--- ERRO ao listar respostas para o template ${templateId}:`, error);
            res.status(500).json({ message: "Ocorreu um erro no servidor." });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }


}

module.exports = new ChecklistController();