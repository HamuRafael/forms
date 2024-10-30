// Inicializa o Signature Pad
var canvas = document.getElementById('signature-pad');
var signaturePad = new SignaturePad(canvas);

// Ajusta o tamanho do canvas para alta resolução
function resizeCanvas() {
  var ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext('2d').scale(ratio, ratio);
  signaturePad.clear(); // Limpa o conteúdo
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Botão para limpar a assinatura
document.getElementById('clear').addEventListener('click', function () {
  signaturePad.clear();
});

// Função para formatar a data no padrão DD/MM/AAAA
function formatDate(dateStr) {
  var parts = dateStr.split('-'); // [AAAA, MM, DD]
  return parts[2] + '/' + parts[1] + '/' + parts[0]; // DD/MM/AAAA
}

// Manipula o envio do formulário
document.getElementById('formulario').addEventListener('submit', function (e) {
  e.preventDefault();

  if (signaturePad.isEmpty()) {
    alert('Por favor, forneça sua assinatura.');
  } else {
    var data = {
      'Número da Margem': document.getElementById('numero_margem').value,
      'Nome do Solicitante': document.getElementById('nome_solicitante').value,
      'Vínculo': document.getElementById('vinculo').value,
      'Data de Emissão do Cancelamento': formatDate(document.getElementById('data_emissao').value),
      'Servidor que Atendeu': document.getElementById('servidor_atendeu').value,
      'Tipo de Documento': document.getElementById('tipo_documento').value,
      'Assinatura': signaturePad.toDataURL('image/png')
    };

    // Envia os dados ao servidor via POST
    fetch('/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(result => {
        if (result.status === 'sucesso') {
          alert('Formulário enviado com sucesso!');
          // Limpa o formulário após o envio
          document.getElementById('formulario').reset();
          signaturePad.clear();
        } else {
          alert('Ocorreu um erro ao enviar o formulário.');
        }
      })
      .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao enviar o formulário.');
      });
  }
});
