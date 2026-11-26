package br.com.byg.barbearia.barbeiro.dto.response;

import java.time.LocalDate;

public record BarbeiroResponseDTO(
        String nome,
        String cpf,
        String telefone,
        String email,
        LocalDate DataNascimento
) {
}
