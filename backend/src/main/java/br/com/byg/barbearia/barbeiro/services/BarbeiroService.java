package br.com.byg.barbearia.barbeiro.services;

import br.com.byg.barbearia.barbeiro.dto.request.BarbeiroRequestDTO;
import br.com.byg.barbearia.barbeiro.dto.response.BarbeiroResponseDTO;
import br.com.byg.barbearia.barbeiro.entities.Barbeiro;
import br.com.byg.barbearia.barbeiro.repositories.BarbeiroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BarbeiroService {


    private final BarbeiroRepository barbeiroRepository;

    @Transactional
    public BarbeiroResponseDTO cadastrarBarbeiro(BarbeiroRequestDTO barbeiroRequestDTO){
        Barbeiro barbeiro = new Barbeiro();

        dtoToEntity(barbeiro, barbeiroRequestDTO);

        barbeiroRepository.save(barbeiro);
        return null;
    }



    private void dtoToEntity(Barbeiro barbeiro, BarbeiroRequestDTO barbeiroRequestDTO){
        barbeiro.setEmail(barbeiroRequestDTO.email());
        barbeiro.setTelefone(barbeiroRequestDTO.telefone());
        barbeiro.setNome(barbeiroRequestDTO.nome());
        barbeiro.setDataNascimento(barbeiroRequestDTO.dataNascimento());
        barbeiro.setSenha(barbeiroRequestDTO.senha());
    }

}
