package br.com.byg.barbearia.cliente.services;

import br.com.byg.barbearia.cliente.dto.request.ClienteRequestDTO;
import br.com.byg.barbearia.cliente.dto.response.ClienteResponseDTO;
import br.com.byg.barbearia.cliente.entities.Cliente;
import br.com.byg.barbearia.cliente.repositories.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional
    public ClienteResponseDTO cadastrarCliente(ClienteRequestDTO dto) {
        Cliente cliente = new Cliente();

        dtoToEntity(cliente, dto);

        Cliente clienteSalvo = clienteRepository.save(cliente);
        return new ClienteResponseDTO(clienteSalvo);
    }

    private void dtoToEntity(Cliente cliente, ClienteRequestDTO dto) {
        cliente.setNome(dto.nome());
        cliente.setEmail(dto.email());
        cliente.setTelefone(dto.telefone());
        cliente.setSenha(dto.senha());
    }
}
