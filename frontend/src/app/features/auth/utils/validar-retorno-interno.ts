const ESQUEMA_URI = /^[a-z][a-z\d+.-]*:/i;

export function validarRetornoInterno(retorno: string | null): string {
  if (
    !retorno ||
    !retorno.startsWith('/') ||
    retorno.startsWith('//') ||
    retorno.includes('\\') ||
    ESQUEMA_URI.test(retorno)
  ) {
    return '/';
  }

  return retorno;
}
