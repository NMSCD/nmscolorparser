const dropArea = document.getElementById("drop-area");
const outputElement = document.getElementsByClassName("output")[0];
const inputElement = document.getElementsByClassName("input")[0];
const errorElement = document.getElementsByClassName("error")[0];
console.log(errorElement)

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function prettyDate2(time) {
  let date = new Date(parseInt(time));
  return date.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute:'2-digit',
    second:'2-digit',
    hour12: false
  });
}

const formatSeconds = s => (new Date(s * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
const format = (date, locale) => new Intl.DateTimeFormat(locale).format(date);

function readFile(input) {
  let file = input[0];
  let fileName = input[0].name;
  console.log(fileName)
  let fileSize = formatBytes(input[0].size,0);
  let lastModified = input[0].lastModified;
  let lastModifiedDate = input[0].lastModifiedDate;
  let filenameUpper = fileName.toUpperCase();

  if(filenameUpper == "BASECOLOURPALETTES.EXML" || filenameUpper == "LEGACYBASECOLOURPALETTES.EXML"){
    let lastDate = format(new Date(lastModified), 'pt-BR')
    let lastTime = prettyDate2(lastModified);
  
    lastModified = new Date(lastModified);
  
    let reader = new FileReader();
  
    //reader.readAsArrayBuffer(file);
    reader.readAsText(file);
    reader.onload = function() {
      let x2js = new X2JS();
      let json = x2js.xml_str2json(reader.result);
      showColors(json)
    };
  

  reader.onerror = function() {
    console.log(reader.error);
  };
} else {
  console.error("Unsupported file");
  errorElement.classList.remove('hidden');
  errorElement.innerHTML = "! Unsupported file !";
}

};

const preventDefaults = e => {
  e.preventDefault();
  e.stopPropagation();
};

const highlight = e => {
  dropArea.classList.add("highlight");
};

const unhighlight = e => {
  dropArea.classList.remove("highlight");
};

const handleDrop = e => {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFile(files);
};

const handleFile = file => {
  readFile(file)
};


["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});
["dragenter", "dragover"].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false);
});
["dragleave", "drop"].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener("drop", handleDrop, false);


function showColors(data){
  let list = data.Data.Property.Property;

  let output = "";
  list.map((item) => {
    output += `
    <div class="block">
    <div class="title">${item._name}</div>
    <div class="colorblock">`;

    let colors = item.Property[1].Property;
    let colorNum = 0;
    colors.map((color) => {
      let R = color.Property[0]._value;
      let G = color.Property[1]._value;
      let B = color.Property[2]._value;
      let A = color.Property[3]._value;
      R = R * 255;
      G = G * 255;
      B = B * 255;
      A = A * 255;
      R = Math.round(R);
      G = Math.round(G);
      B = Math.round(B);
      A = Math.round(A);

      let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
      output += `<span class="color" style="background-color:${bgcolor}">${colorNum}</span>`;
      colorNum = colorNum + 1;
    });
    output += `</div></div>`;

  });
  //$('.output').html(output);
  outputElement.classList.remove("hidden");
  inputElement.classList.add("hidden");
  document.querySelector('.output').innerHTML = output;
}
