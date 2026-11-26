package br.com.byg.barbearia.cliente.dto.response;

import br.com.byg.barbearia.cliente.entities.Cliente;

public record ClienteResponseDTO(
        Long id,
        String nome,
        String email,
        String telefone
) {
    public ClienteResponseDTO(Cliente cliente) {
        this(
                cliente.getId(),
                cliente.getNome(),
                cliente.getEmail(),
                cliente.getTelefone()
        );
    }
}
