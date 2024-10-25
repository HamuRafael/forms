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
  var parts = dateStr.split('-'); // Separa em [AAAA, MM, DD]
  return parts[2] + '/' + parts[1] + '/' + parts[0]; // Retorna DD/MM/AAAA
}

// Manipula o envio do formulário
document.getElementById('formulario').addEventListener('submit', function (e) {
  e.preventDefault();

  if (signaturePad.isEmpty()) {
    alert('Por favor, forneça sua assinatura.');
  } else {
    var numeroMargem = document.getElementById('numero_margem').value;

    var data = {
      'Número da Margem': numeroMargem,
      'Nome do Solicitante': document.getElementById('nome_solicitante').value,
      'Vínculo': document.getElementById('vinculo').value,
      'Data de Emissão do Cancelamento': formatDate(document.getElementById('data_emissao').value),
      'Servidor que Atendeu': document.getElementById('servidor_atendeu').value,
      'Tipo de Documento': document.getElementById('tipo_documento').value,
      'Assinatura': signaturePad.toDataURL('image/png')
    };

    // Gera o PDF
    generatePDF(data);

    // Limpa o formulário após o download
    document.getElementById('formulario').reset();
    signaturePad.clear();

    alert('Formulário enviado com sucesso!');
  }
});

function generatePDF(data) {
  // Cria um novo documento PDF
  const { jsPDF } = window.jspdf;
  var doc = new jsPDF();

  // Adiciona o título
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Formulário de Cancelamento', 105, 20, null, null, 'center');

  // Define os dados para a tabela
  var tableData = [
    ['Número da Margem', data['Número da Margem']],
    ['Nome do Solicitante', data['Nome do Solicitante']],
    ['Vínculo', data['Vínculo']],
    ['Data de Emissão do Cancelamento', data['Data de Emissão do Cancelamento']],
    ['Servidor que Atendeu', data['Servidor que Atendeu']],
    ['Tipo de Documento', data['Tipo de Documento']]
  ];

  // Adiciona a tabela ao PDF
  doc.autoTable({
    startY: 30,
    head: [['Campo', 'Valor']],
    body: tableData,
    styles: {
      fontSize: 12
    },
    headStyles: {
      fillColor: [255, 204, 204], // Cor de fundo do cabeçalho
      textColor: 0,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 60 }, // Largura da coluna dos campos
      1: { cellWidth: 120 } // Largura da coluna dos valores
    }
  });

  // Adiciona a assinatura
  var imgData = data['Assinatura'];
  var imgWidth = 100;
  var imgHeight = 50;
  var positionY = doc.lastAutoTable.finalY + 20;

  doc.setFont('helvetica', 'bold');
  doc.text('Assinatura:', 14, positionY);

  doc.addImage(imgData, 'PNG', 14, positionY + 5, imgWidth, imgHeight);

  // Salva o PDF com o nome baseado no número da margem
  doc.save(data['Número da Margem'] + '.pdf');
}
