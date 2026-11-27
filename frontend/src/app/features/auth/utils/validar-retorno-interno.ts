const ORIGEM_APLICACAO = 'https://byg.invalid';
const CARACTERES_INVALIDOS = /[\u0000-\u001f\u007f\s]/u;

export function validarRetornoInterno(retorno: string | null): string {
  if (!retorno || !retorno.startsWith('/') || CARACTERES_INVALIDOS.test(retorno)) {
    return '/';
  }

  let retornoDecodificado: string;

  try {
    retornoDecodificado = decodeURIComponent(retorno);
  } catch {
    return '/';
  }

  if (
    !retornoDecodificado.startsWith('/') ||
    retornoDecodificado.startsWith('//') ||
    retornoDecodificado.includes('\\') ||
    CARACTERES_INVALIDOS.test(retornoDecodificado)
  ) {
    return '/';
  }

  const urlOriginal = new URL(retorno, ORIGEM_APLICACAO);
  const urlDecodificada = new URL(retornoDecodificado, ORIGEM_APLICACAO);

  if (
    urlOriginal.origin !== ORIGEM_APLICACAO ||
    urlDecodificada.origin !== ORIGEM_APLICACAO ||
    urlDecodificada.pathname.replace(/\/+$/, '') === '/login'
  ) {
    return '/';
  }

  return retorno;
}
