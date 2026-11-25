package br.com.byg.barbearia.barbeiro.dto.response;

public record BarbeiroResponseDTO(
        String nome,
        String cpf,
        String telefone,
        String email,
        String DataNascimento
) {
}
