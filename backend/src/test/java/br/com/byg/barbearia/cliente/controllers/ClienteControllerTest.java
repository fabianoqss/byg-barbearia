package br.com.byg.barbearia.cliente.controllers;

import br.com.byg.barbearia.cliente.dto.request.ClienteRequestDTO;
import br.com.byg.barbearia.cliente.dto.response.ClienteResponseDTO;
import br.com.byg.barbearia.cliente.services.ClienteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.never;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ClienteController.class)
@WithMockUser
class ClienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ClienteService clienteService;

    @Test
    void deveCadastrarClienteERetornarCreated() throws Exception {
        given(clienteService.cadastrarCliente(any(ClienteRequestDTO.class)))
                .willReturn(new ClienteResponseDTO(1L, "João Silva", "joao@email.com", "11987654321"));

        mockMvc.perform(post("/clientes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "João Silva",
                                  "email": "joao@email.com",
                                  "telefone": "11987654321",
                                  "senha": "senhaSegura123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/clientes/1"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("joao@email.com"))
                .andExpect(jsonPath("$.senha").doesNotExist());
    }

    @Test
    void deveRetornarBadRequestComErrosDosCamposQuandoEntradaInvalida() throws Exception {
        mockMvc.perform(post("/clientes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "",
                                  "email": "email-invalido",
                                  "telefone": "(11) 98765-4321",
                                  "senha": "curta"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_PROBLEM_JSON_VALUE))
                .andExpect(jsonPath("$.title").value("Dados inválidos"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.erros[*].campo").value(containsInAnyOrder("nome", "email", "telefone", "senha")));

        then(clienteService).should(never()).cadastrarCliente(any());
    }

    @Test
    void deveRetornarBadRequestQuandoJsonMalformado() throws Exception {
        mockMvc.perform(post("/clientes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"nome\": "))
                .andExpect(status().isBadRequest())
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_PROBLEM_JSON_VALUE))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void deveRetornarErroInternoSemExporDetalhesQuandoFalhaInesperada() throws Exception {
        willThrow(new IllegalStateException("detalhe interno sensível"))
                .given(clienteService).cadastrarCliente(any(ClienteRequestDTO.class));

        mockMvc.perform(post("/clientes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "João Silva",
                                  "email": "joao@email.com",
                                  "telefone": "11987654321",
                                  "senha": "senhaSegura123"
                                }
                                """))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.title").value("Erro interno"))
                .andExpect(jsonPath("$.detail").value("Ocorreu um erro inesperado. Tente novamente mais tarde."));
    }
}
