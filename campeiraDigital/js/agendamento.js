
/* ============================
   AGENDAMENTO - CAMPEIRA DIGITAL
============================ */

const formulario = document.getElementById("form-agendamento");
const campoServico = document.getElementById("servico");
const mensagemAgendamento = document.getElementById("mensagem-agendamento");

let servicosDisponiveis = [
    "Banho e tosa",
    "Atendimento veterinário",
    "Orientação sobre alimentação"
];

let erroAoCarregarServicos = false;

// Carrega os serviços cadastrados
try {
    const dadosSalvos = localStorage.getItem("servicos");

    if (dadosSalvos !== null) {
        const servicosSalvos = JSON.parse(dadosSalvos);

        if (
            !Array.isArray(servicosSalvos) ||
            servicosSalvos.some(function (servico) {
                return (
                    servico === null ||
                    typeof servico !== "object" ||
                    Array.isArray(servico) ||
                    typeof servico.nome !== "string"
                );
            })
        ) {
            throw new Error("Formato de serviços inválido.");
        }

        servicosDisponiveis = servicosSalvos
            .map(function (servico) {
                return servico.nome.trim();
            })
            .filter(function (nome) {
                return nome.length > 0;
            });
    }
} catch (erro) {
    console.error("Erro ao carregar serviços:", erro);
    servicosDisponiveis = [];
    erroAoCarregarServicos = true;
}

// Preenche a lista de serviços
if (campoServico) {
    if (erroAoCarregarServicos) {
        campoServico.options[0].textContent =
            "Não foi possível carregar os serviços";
        campoServico.disabled = true;
    } else {
        // Remove opções anteriores, mantendo a opção inicial
        campoServico.replaceChildren(campoServico.options[0]);

        const servicosUnicos = [...new Set(servicosDisponiveis)];

        if (servicosUnicos.length === 0) {
            campoServico.options[0].textContent =
                "Nenhum serviço disponível no momento";
            campoServico.disabled = true;
        } else {
            servicosUnicos.forEach(function (nomeServico) {
                const opcao = document.createElement("option");

                opcao.value = nomeServico;
                opcao.textContent = nomeServico;

                campoServico.appendChild(opcao);
            });
        }
    }
}

// Envia a solicitação pelo WhatsApp
if (formulario) {
    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const servico = campoServico.value;
        const data = document.getElementById("data").value;
        const horario = document.getElementById("horario").value;
        const telefone = document.getElementById("telefone").value.trim();
        const observacoes = document.getElementById("observacoes").value.trim();

        // Valida os campos
        if (!nome || !servico || !data || !horario || !telefone) {
            mensagemAgendamento.textContent =
                "Preencha todos os campos obrigatórios.";
            return;
        }

        if (!servicosDisponiveis.includes(servico)) {
            mensagemAgendamento.textContent =
                "Selecione um serviço válido.";
            return;
        }

        // Formata a data para o padrão brasileiro
        const partesData = data.split("-");
        const dataFormatada =
            partesData[2] + "/" + partesData[1] + "/" + partesData[0];

        const mensagem = [
            "Olá! Gostaria de solicitar um agendamento.",
            "",
            "Nome: " + nome,
            "Serviço: " + servico,
            "Data: " + dataFormatada,
            "Horário: " + horario,
            "Telefone: " + telefone,
            "Observações: " + (observacoes || "Nenhuma"),
            "",
            "Aguardo a confirmação do agendamento."
        ].join("\n");

        const numeroWhatsApp = "5548996677453";

        const link =
            "https://wa.me/" +
            numeroWhatsApp +
            "?text=" +
            encodeURIComponent(mensagem);

        window.open(link, "_blank", "noopener,noreferrer");

        mensagemAgendamento.textContent =
            "Solicitação preparada! Finalize o envio pelo WhatsApp.";
    });
}
