package br.com.byg.barbearia.barbeiro.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Barbeiro {

    @Id
    private Long id;

    private String nome;
    private String email;
    private String telefone;
    private LocalDate dataNascimento;
    private String senha;


}
