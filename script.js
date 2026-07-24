let currentQR = null;

function validURL(str){
    try{
        const url = new URL(str);
        return url.protocol==="http:" || url.protocol==="https:";
    }catch{
        return false;
    }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight){

    const chars = text.split("");
    let line = "";

    for(let i=0;i<chars.length;i++){

        const testLine = line + chars[i];

        if(ctx.measureText(testLine).width > maxWidth && line !== ""){
            ctx.fillText(line,x,y);
            line = chars[i];
            y += lineHeight;
        }else{
            line = testLine;
        }
    }

    ctx.fillText(line,x,y);
}

function generateQR(){

    const url = document.getElementById("url").value.trim();
    const area = document.getElementById("qrcode");
    const error = document.getElementById("error");
    const qrText = document.getElementById("qrText");

    area.innerHTML = "";
    error.textContent = "";
    qrText.textContent = "";

    if(!validURL(url)){
        error.textContent = "正しいURLを入力してください。";
        return;
    }

    currentQR = new QRCode(area,{
        text:url,
        width:220,
        height:220,
        colorDark:"#000000",
        colorLight:"#ffffff",
        correctLevel:QRCode.CorrectLevel.H
    });

    qrText.textContent = url;
}

async function downloadQR(){

    const img = document.querySelector("#qrcode img");
    const canvas = document.querySelector("#qrcode canvas");

    if(!img && !canvas){
        alert("先にQRコードを生成してください。");
        return;
    }

    const src = img ? img.src : canvas.toDataURL("image/png");

    const image = new Image();

image.onload = function(){

    // 各種設定
    const margin = 35;
    const lineHeight = 20;
    const url = document.getElementById("url").value.trim();
    const includeText = document.getElementById("includeText").value === "show";
    const saveName = document.getElementById("fileName").value.trim() || "QRCode";

    // 文字数計算用キャンバス
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.font = "16px Yu Gothic";

    let line = "";
    let lineCount = 1;

    for(const ch of url){

        const testLine = line + ch;

        if(tempCtx.measureText(testLine).width > image.width + margin * 2 - 20){
            lineCount++;
            line = ch;
        }else{
            line = testLine;
        }

    }

    const textHeight = includeText ? lineCount * lineHeight + 20 : 0;

    // 出力用キャンバス
    const outCanvas = document.createElement("canvas");
    outCanvas.width = image.width + margin * 2;
    outCanvas.height = image.height + margin * 2 + textHeight;

    const ctx = outCanvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    // QRコード描画
    ctx.drawImage(image, margin, margin);

    // URL表示
    if(includeText){

        ctx.fillStyle = "#000000";
        ctx.font = "16px Yu Gothic";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        wrapText(
            ctx,
            url,
            outCanvas.width / 2,
            image.height + margin * 2 + 8,
            outCanvas.width - 20,
            lineHeight
        );
    }

    // 保存形式
    const type = document.getElementById("downloadType").value;

    if(type === "png"){

        const a = document.createElement("a");
        a.href = outCanvas.toDataURL("image/png");
        a.download = saveName + ".png";
        a.click();

    }else{

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const pdfWidth = 70;
        const pdfHeight = pdfWidth * outCanvas.height / outCanvas.width;

        pdf.addImage(
            outCanvas.toDataURL("image/png"),
            "PNG",
            70,
            40,
            pdfWidth,
            pdfHeight
        );

        pdf.save(saveName + ".pdf");
    }

};

    image.src = src;


}

document
.getElementById("generateBtn")
.addEventListener("click", generateQR);

document
.getElementById("downloadBtn")
.addEventListener("click", downloadQR);
