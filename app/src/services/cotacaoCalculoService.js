const pool = require('../config/database');

class CotacaoCalculoService {
  async calcularValorBase(clienteId, tipoServico, params) {
    const { pesoKg, kmPercorrido, codigoIata, tipoVeiculo } = params;

    const [tabela] = await pool.execute(
      `SELECT * FROM cotacao_tabela_cliente 
       WHERE cliente_id = ? 
       AND tipo_servico = ? 
       AND ativo = 1
       ${codigoIata ? 'AND codigo_iata = ?' : ''}
       ${tipoVeiculo ? 'AND tipo_veiculo = ?' : ''}
       LIMIT 1`,
      codigoIata 
        ? [clienteId, tipoServico, codigoIata]
        : tipoVeiculo 
          ? [clienteId, tipoServico, tipoVeiculo]
          : [clienteId, tipoServico]
    );

    if (tabela.length === 0) {
      throw new Error('Tabela de preços não encontrada para este cliente e serviço');
    }

    const config = tabela[0];
    let valorBase = parseFloat(config.frete_minimo);

    if (tipoServico === 'WEAir Convencional' || tipoServico === 'WEAir Expresso') {
      const pesoMinimo = parseFloat(config.peso_minimo);
      if (pesoKg > pesoMinimo) {
        const pesoExcedente = pesoKg - pesoMinimo;
        valorBase += pesoExcedente * parseFloat(config.valor_kg_excedente);
      }
    } else if (tipoServico === 'WEAir Proximo Voo') {
      valorBase = this.calcularProximoVoo(pesoKg, config);
    } else if (tipoServico === 'WExpress') {
      const kmMinimo = parseInt(config.km_minimo);
      if (kmPercorrido > kmMinimo) {
        const kmExcedente = kmPercorrido - kmMinimo;
        valorBase += kmExcedente * parseFloat(config.valor_km_excedente);
      }
    }

    return {
      valorBase: parseFloat(valorBase.toFixed(2)),
      configuracao: config
    };
  }

  calcularProximoVoo(pesoKg, config) {
    return parseFloat(config.frete_minimo);
  }

  async calcularGeneralidades(valorBase, generalidadesIds) {
    if (!generalidadesIds || generalidadesIds.length === 0) {
      return { valorGeneralidades: 0, generalidadesAplicadas: [] };
    }

    const placeholders = generalidadesIds.map(() => '?').join(',');
    const [generalidades] = await pool.execute(
      `SELECT * FROM cotacao_generalidades WHERE id IN (${placeholders}) AND ativo = 1`,
      generalidadesIds
    );

    let valorGeneralidades = 0;
    const generalidadesAplicadas = [];

    for (const gen of generalidades) {
      let valorAplicado = 0;
      if (gen.tipo === 'fixo') {
        valorAplicado = parseFloat(gen.valor);
      } else if (gen.tipo === 'percentual') {
        valorAplicado = valorBase * parseFloat(gen.valor);
      }

      valorGeneralidades += valorAplicado;
      generalidadesAplicadas.push({
        generalidade_id: gen.id,
        nome: gen.nome,
        tipo: gen.tipo,
        valor: parseFloat(gen.valor),
        valor_aplicado: parseFloat(valorAplicado.toFixed(2))
      });
    }

    return {
      valorGeneralidades: parseFloat(valorGeneralidades.toFixed(2)),
      generalidadesAplicadas
    };
  }

  calcularValorCliente(valorBase, valorGeneralidades) {
    return parseFloat((valorBase + valorGeneralidades).toFixed(2));
  }

  calcularValorAgregado(valorFreteAgregado, valorKmAgregado, kmPercorrido) {
    const total = parseFloat(valorFreteAgregado) + (parseFloat(valorKmAgregado) * parseFloat(kmPercorrido || 0));
    return parseFloat(total.toFixed(2));
  }

  calcularRentabilidade(valorCliente, valorAgregado) {
    const valorRentabilidade = valorCliente - valorAgregado;
    const percentualRentabilidade = valorCliente > 0 
      ? (valorRentabilidade / valorCliente) * 100 
      : 0;

    return {
      valorRentabilidade: parseFloat(valorRentabilidade.toFixed(2)),
      percentualRentabilidade: parseFloat(percentualRentabilidade.toFixed(2))
    };
  }

  async calcularCotacaoCompleta(data) {
    const { 
      clienteId, 
      tipoServico, 
      pesoKg, 
      kmPercorrido, 
      codigoIata, 
      tipoVeiculo,
      generalidadesIds,
      valorFreteAgregado,
      valorKmAgregado
    } = data;

    const { valorBase, configuracao } = await this.calcularValorBase(clienteId, tipoServico, {
      pesoKg,
      kmPercorrido,
      codigoIata,
      tipoVeiculo
    });

    const { valorGeneralidades, generalidadesAplicadas } = await this.calcularGeneralidades(
      valorBase, 
      generalidadesIds
    );

    const valorCliente = this.calcularValorCliente(valorBase, valorGeneralidades);

    const valorAgregado = this.calcularValorAgregado(
      valorFreteAgregado || 0,
      valorKmAgregado || 0,
      kmPercorrido || 0
    );

    const { valorRentabilidade, percentualRentabilidade } = this.calcularRentabilidade(
      valorCliente,
      valorAgregado
    );

    return {
      valorBase,
      valorGeneralidades,
      valorCliente,
      valorAgregado,
      valorRentabilidade,
      percentualRentabilidade,
      generalidadesAplicadas,
      configuracao
    };
  }

  async buscarLeadTime(codigoIata) {
    const [result] = await pool.execute(
      'SELECT * FROM cotacao_lead_time WHERE codigo_iata = ? AND ativo = 1',
      [codigoIata]
    );

    return result.length > 0 ? result[0] : null;
  }
}

module.exports = new CotacaoCalculoService();
