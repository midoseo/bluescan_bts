/* ===== pdfExport.js — 화면 요소를 PDF 파일로 다운로드 =====
 * jsPDF의 기본 폰트는 한글 글리프가 없어 한글이 깨진다. html2canvas로 화면에 실제 렌더링된
 * DOM(브라우저 폰트 사용 — 한글 정상 표시)을 캡처해 이미지로 PDF에 삽입하는 방식으로 우회한다.
 * 내용이 A4 한 페이지보다 길면 자동으로 다음 페이지에 이어 붙인다.
 */
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportElementToPdf(el, filename) {
  if (!el) return;
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
    heightLeft -= pageH;
  }
  pdf.save(filename);
}
