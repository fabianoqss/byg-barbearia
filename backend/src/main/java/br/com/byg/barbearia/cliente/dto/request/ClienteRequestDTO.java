package br.com.byg.barbearia.cliente.dto.request;

public record ClienteRequestDTO(
        String nome,
        String email,
        String telefone,
        String senha
) {
}
