import { redirect } from 'next/navigation';

export default function HomePage() {
  // Esta função do Next.js redireciona o usuário para a rota especificada.
  // Como esta é a página raiz, qualquer um que acessar "/" será enviado para "/login".
  redirect('/login');

  // O código abaixo nunca será executado, pois o redirect interrompe o processo,
  // mas é bom ter um retorno para o componente.
  return null;
}