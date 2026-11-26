package br.com.byg.barbearia.cliente.repositories;

import br.com.byg.barbearia.cliente.entities.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}
