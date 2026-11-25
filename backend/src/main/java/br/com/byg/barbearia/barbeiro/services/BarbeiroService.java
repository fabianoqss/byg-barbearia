package br.com.byg.barbearia.barbeiro.services;

import br.com.byg.barbearia.barbeiro.dto.request.BarbeiroRequestDTO;
import br.com.byg.barbearia.barbeiro.entities.Barbeiro;
import br.com.byg.barbearia.barbeiro.repositories.BarbeiroRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BarbeiroService {


    private final BarbeiroRepository barbeiroRepository;

    @Transactional
    public BarbeiroRequestDTO cadastrarBarbeiro(BarbeiroRequestDTO barbeiroRequestDTO){
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
