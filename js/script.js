const dropArea = document.getElementById("drop-area");
const outputElement = document.getElementsByClassName("output")[0];
const inputElement = document.getElementsByClassName("input")[0];
const errorElement = document.getElementsByClassName("error")[0];
const menu = document.getElementsByClassName("menu")[0];
const settings = document.getElementsByClassName("settings")[0];
const settingsClose = document.getElementsByClassName("settings-close")[0];
const body = document.getElementsByTagName("body")[0];
const overlay = document.getElementsByClassName("overlay")[0];
const settingsOption = document.querySelectorAll(".settings .block");
const supportedFilesElement = document.getElementsByClassName("supported-files")[0];
const restart = document.getElementsByClassName("restart")[0];
const versionElement = document.getElementsByClassName("version")[0];

const version = "0.7";
versionElement.innerText = version;

const config = {
  startIndexZero: false,
  _16colorsPerLine: false
}
const colorData = {};

menu.onclick = function () {
  settings.classList.toggle('active');
  overlay.classList.toggle('active');
}
overlay.onclick = function () {
  settings.classList.toggle('active');
  this.classList.toggle('active');
}

restart.onclick = function () {
  this.classList.add("active");
  window.setTimeout(function () {
    restart.classList.remove('active');
  }, 500);
  outputElement.classList.add("hidden");
  inputElement.classList.remove("hidden");
  document.querySelector('.output').innerHTML = "";
}
settingsClose.onclick = function () {
  settings.classList.toggle('active');
  overlay.classList.toggle('active');
}

settingsOption.forEach(function (setting) {
  setting.onclick = function () {
    let option = this.getAttribute("data-option");
    let value = this.getAttribute("data-value");
    this.querySelector('.checkmark').classList.toggle('active');
    config[option] = config[option] ? false : true;

    if (colorData.data) {
      showColors(colorData.data)
    }

  }
});

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
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function loadFile(file) {
  let json = null;
  fetch(`./files/${file}.EXML`)
    .then(response => response.text())
    .then(function (text) {
      let x2js = new X2JS();
      let json = x2js.xml_str2json(text);
      json.file = file;
      colorData.data = json;
      showColors(json)
    })
}

const formatSeconds = s => (new Date(s * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
const format = (date, locale) => new Intl.DateTimeFormat(locale).format(date);

const supportedFiles = [
  "LEGACYBASECOLOURPALETTES",
  "BASECOLOURPALETTES",
  "WATERCOLOURS",
  "SPACERARESKYCOLOURS",
  "SPACESKYCOLOURS",
  "DAYSKYCOLOURS",
  "DAYSKYCOLOURS_FIRESTORM",
  "DAYSKYCOLOURS_GRAVSTORM",
  "DUSKSKYCOLOURS",
  "NIGHTSKYCOLOURS"
]

supportedFiles.forEach(file => {
  let supportedFile = `<span class="filename">${file}</span>`
  supportedFilesElement.insertAdjacentHTML('beforeend', supportedFile);
});
let files = document.querySelectorAll('.filename');
files.forEach(file => {
  file.onclick = function (file) {
    let filename = file.target.textContent;
    loadFile(filename);
  }
})

function readFile(input) {
  let file = input[0];
  let fileName = input[0].name;
  let fileSize = formatBytes(input[0].size, 0);
  let lastModified = input[0].lastModified;
  let lastModifiedDate = input[0].lastModifiedDate;
  let filenameUpper = fileName.toUpperCase();
  let fileNameOnly = filenameUpper.split(".")[0];

  if (supportedFiles.includes(fileNameOnly)) {
    let lastDate = format(new Date(lastModified), 'pt-BR')
    let lastTime = prettyDate2(lastModified);

    lastModified = new Date(lastModified);

    let reader = new FileReader();

    //reader.readAsArrayBuffer(file);
    reader.readAsText(file);
    reader.onload = function () {
      let x2js = new X2JS();
      let json = x2js.xml_str2json(reader.result);
      json.file = fileNameOnly;
      colorData.data = json;
      showColors(json)
    };


    reader.onerror = function () {
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


function showColors(data) {
  let colorsPerLine = 8;
  if (config._16colorsPerLine) {
    colorsPerLine = 16;
  }
  const fileTitle = document.getElementsByClassName("fileTitle")[0];

  if(fileTitle){
    fileTitle.remove();
  }

  let output = "";
  let title = `<div class="fileTitle">${data.file}</div>`;
  outputElement.insertAdjacentHTML('beforeBegin', title);



  if (data.file === "WATERCOLOURS" || data.file === "SPACERARESKYCOLOURS" || data.file === "SPACESKYCOLOURS") {
    let newList = [];
    let list = data.Data.Property.Property;
    list = list.map((item) => {
      output += `
      <div class="block">
      <div class="colors">`;

      let colors = item.Property;
      let colorNum = 1;
      if (config.startIndexZero) {
        colorNum = 0
      }
      colors.map((color) => {
        let colorName = color._name;
        let R = color.Property[0]._value;
        let G = color.Property[1]._value;
        let B = color.Property[2]._value;
        let A = color.Property[3]._value;
        R = Math.round(R * 255);
        G = Math.round(G * 255);
        B = Math.round(B * 255);
        A = Math.round(A * 255);
        let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
        let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
        //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
        //Color('rgb(255, 255, 255)')

        let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
        output += `<div class="colorline">
        <span class="name" style="background-color:${bgcolor}">${colorName}</span>
        <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
        </div>`;
        colorNum = colorNum + 1;
      });
      output += `</div></div>`;

    });

  }
  else if (data.file === "DAYSKYCOLOURS" || data.file === "DAYSKYCOLOURS_FIRESTORM" || data.file === "DAYSKYCOLOURS_GRAVSTORM") {
    list = data.Data.Property[0].Property.Property;
    let name = data.Data.Property[0]._name;

    output += `<div class="group-title">${name}</div>`;
    list = list.map((item) => {
      output += `
      <div class="block">
      <div class="colors">`;

      let colors = item.Property;
      let colorNum = 1;
      if (config.startIndexZero) {
        colorNum = 0
      }
      colors.map((color) => {
        let colorName = color._name;
        let R = color.Property[0]._value;
        let G = color.Property[1]._value;
        let B = color.Property[2]._value;
        let A = color.Property[3]._value;
        R = Math.round(R * 255);
        G = Math.round(G * 255);
        B = Math.round(B * 255);
        A = Math.round(A * 255);
        let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
        let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
        //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
        //Color('rgb(255, 255, 255)')

        let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
        output += `<div class="colorline">
        <span class="name" style="background-color:${bgcolor}">${colorName}</span>
        <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
        </div>`;
        colorNum = colorNum + 1;
      });
      output += `</div></div>`;
    });


    let secondList = data.Data.Property[1].Property;
    let secondName = data.Data.Property[1]._name;
    output += `<div class="group-title">${secondName}</div>`;

    secondList.map((item) => {
      let groupName = item._name;
      let types = null;
      if (item.Property.Property){
        if (item.Property.Property && item.Property.Property.length > 0){
          types = item.Property.Property;
        } else {
          if (item.Property.Property.Property && item.Property.Property.Property.length > 0){
            output += `<div class="group-title">${groupName}</div>`;
            output += `
            <div class="block">
            <div class="colors">`;

            let colorNum = 1;
            if (config.startIndexZero) {
              colorNum = 0
            };
            let colors = item.Property.Property.Property
            colors.map((color) => {
              let colorName = color._name;
              let R = color.Property[0]._value;
              let G = color.Property[1]._value;
              let B = color.Property[2]._value;
              let A = color.Property[3]._value;
              R = Math.round(R * 255);
              G = Math.round(G * 255);
              B = Math.round(B * 255);
              A = Math.round(A * 255);
              let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
              let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
              //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
              //Color('rgb(255, 255, 255)')

              let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
              output += `<div class="colorline" style="background-color:grey">
              <span class="name" style="background-color:${bgcolor}">${colorName}</span>
              <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
              </div>`;
              colorNum = colorNum + 1;
            });
            output += `</div></div>`;
          }
        } 
      }

      if(types){

        output += `<div class="group-title">${groupName}</div>`;
        types.map((type) => {
          output += `
          <div class="block">
          <div class="colors">`;

          let colorNum = 1;
          if (config.startIndexZero) {
            colorNum = 0
          };
          let colors = type.Property;
          colors.map((color) => {
            let colorName = color._name;
            let R = color.Property[0]._value;
            let G = color.Property[1]._value;
            let B = color.Property[2]._value;
            let A = color.Property[3]._value;
            R = Math.round(R * 255);
            G = Math.round(G * 255);
            B = Math.round(B * 255);
            A = Math.round(A * 255);
            let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
            let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
            //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
            //Color('rgb(255, 255, 255)')

            let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
            output += `<div class="colorline">
            <span class="name" style="background-color:${bgcolor}">${colorName}</span>
            <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
            </div>`;
            colorNum = colorNum + 1;
          });
          output += `</div></div>`;
        });
        
      }
    });
  }
  else if(data.file ==="DUSKSKYCOLOURS" || data.file ==="NIGHTSKYCOLOURS"){
    list = data.Data.Property[0].Property.Property;
    let name = data.Data.Property[0]._name;

    output += `<div class="group-title">${name}</div>`;

    output += `
      <div class="block">
      <div class="colors">`;

    let colors = data.Data.Property[0].Property.Property.Property;
    let colorNum = 1;
    if (config.startIndexZero) {
      colorNum = 0
    }
    colors.map((color) => {
      let colorName = color._name;
      let R = color.Property[0]._value;
      let G = color.Property[1]._value;
      let B = color.Property[2]._value;
      let A = color.Property[3]._value;
      R = Math.round(R * 255);
      G = Math.round(G * 255);
      B = Math.round(B * 255);
      A = Math.round(A * 255);
      let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
      let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
      //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
      //Color('rgb(255, 255, 255)')

      let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
      output += `<div class="colorline">
      <span class="name" style="background-color:${bgcolor}">${colorName}</span>
      <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
      </div>`;
      colorNum = colorNum + 1;
    });
    output += `</div></div>`;

    let secondList = data.Data.Property[1].Property;
    let secondName = data.Data.Property[1]._name;
    output += `<div class="group-title">${secondName}</div>`;

    secondList.map((item) => {
      let groupName = item._name;
      let types = null;
      if (item.Property.Property){
        if (item.Property.Property && item.Property.Property.length > 0){
          types = item.Property.Property;
        } else {
          if (item.Property.Property.Property && item.Property.Property.Property.length > 0){
            output += `<div class="group-title">${groupName}</div>`;
            output += `
            <div class="block">
            <div class="colors">`;

            let colorNum = 1;
            if (config.startIndexZero) {
              colorNum = 0
            };
            let colors = item.Property.Property.Property
            colors.map((color) => {
              let colorName = color._name;
              let R = color.Property[0]._value;
              let G = color.Property[1]._value;
              let B = color.Property[2]._value;
              let A = color.Property[3]._value;
              R = Math.round(R * 255);
              G = Math.round(G * 255);
              B = Math.round(B * 255);
              A = Math.round(A * 255);
              let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
              let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
              //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
              //Color('rgb(255, 255, 255)')

              let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
              output += `<div class="colorline" style="background-color:grey">
              <span class="name" style="background-color:${bgcolor}">${colorName}</span>
              <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
              </div>`;
              colorNum = colorNum + 1;
            });
            output += `</div></div>`;
          }
        } 
      }

      if(types){

        output += `<div class="group-title">${groupName}</div>`;
        types.map((type) => {
          output += `
          <div class="block">
          <div class="colors">`;

          let colorNum = 1;
          if (config.startIndexZero) {
            colorNum = 0
          };
          let colors = type.Property;
          colors.map((color) => {
            let colorName = color._name;
            let R = color.Property[0]._value;
            let G = color.Property[1]._value;
            let B = color.Property[2]._value;
            let A = color.Property[3]._value;
            R = Math.round(R * 255);
            G = Math.round(G * 255);
            B = Math.round(B * 255);
            A = Math.round(A * 255);
            let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
            let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
            //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
            //Color('rgb(255, 255, 255)')

            let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
            output += `<div class="colorline">
            <span class="name" style="background-color:${bgcolor}">${colorName}</span>
            <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
            </div>`;
            colorNum = colorNum + 1;
          });
          output += `</div></div>`;
        });
        
      }
    });


  }
  else {
    let list = data.Data.Property.Property;
    list.map((item) => {
      output += `
      <div class="block">
      <div class="title">${item._name}</div>
      <div class="colorblock" style="grid-template-columns: repeat(${colorsPerLine}, 1fr);">`;

      let colors = item.Property[1].Property;
      let colorNum = 1;
      if (config.startIndexZero) {
        colorNum = 0
      }
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
  }



  //$('.output').html(output);
  outputElement.classList.remove("hidden");
  inputElement.classList.add("hidden");
  document.querySelector('.output').innerHTML = output;
  tippy('[data-tippy-content]');
}