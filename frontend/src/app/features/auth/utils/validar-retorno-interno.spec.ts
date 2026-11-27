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
    '/\u005c\u005cexterno.example',
    '/barbeiro\\agenda',
  ])('usa a página inicial para destino inválido %s', (destino) => {
    expect(validarRetornoInterno(destino)).toBe('/');
  });
});
