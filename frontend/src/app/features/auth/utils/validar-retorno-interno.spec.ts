import { validarRetornoInterno } from './validar-retorno-interno';

describe('validarRetornoInterno', () => {
  it('preserva caminhos internos com query string e fragmento', () => {
    expect(validarRetornoInterno('/agendar?servico=corte#horario')).toBe(
      '/agendar?servico=corte#horario',
    );
  });

  it.each([
    null,
    '',
    'agendar',
    '//externo.example/path',
    'https://externo.example/path',
    'javascript:alert(1)',
    '/\\externo.example',
    '/barbeiro\\agenda',
    '/%2F%2Fevil',
    '/%5Cevil',
    '/\t/evil',
    '/\r\n/evil',
    '/ /evil',
    '/login',
    '/login?returnUrl=%2Fagendar',
    '/login#topo',
    '%E0%A4%A',
    '/%E0%A4%A',
  ])('usa a página inicial para destino inválido %s', (destino) => {
    expect(validarRetornoInterno(destino)).toBe('/');
  });

  it('rejeita origem externa após interpretar a URL', () => {
    expect(validarRetornoInterno('//externo.example/path')).toBe('/');
  });
});
