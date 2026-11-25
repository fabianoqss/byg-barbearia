package br.com.byg.barbearia.barbeiro.dto.request;

import java.time.LocalDate;

public record BarbeiroRequestDTO(
        String nome,
        String telefone,
        String email,
        String cpf,
        String senha,
        LocalDate dataNascimento
) {
}
