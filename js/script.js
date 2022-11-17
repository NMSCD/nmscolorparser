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
const settingsColorOption = document.querySelectorAll(".settings .color-option");
const supportedFilesElement = document.getElementsByClassName("supported-files")[0];
const restart = document.getElementsByClassName("restart")[0];
const versionElement = document.getElementsByClassName("version")[0];

const customColor = document.getElementsByClassName("custom-color")[0];

const version = "4.06";
versionElement.innerText = `NMS v. ${version}`;

const config = {
  startIndexZero: false,
  _16colorsPerLine: false,
  hideWhitePalettes: false
}
const colorData = {};
const customColorOutput = [];

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
  document.querySelector(".fileTitle").innerHTML = "";
  colorData.data = {};
  
}

settingsClose.onclick = function () {
  settings.classList.toggle('active');
  overlay.classList.toggle('active');
}

settingsOption.forEach(function (setting) {
  setting.onclick = function () {
    let option = this.getAttribute("data-option");
    this.querySelector('.checkmark').classList.toggle('active');
    config[option] = config[option] ? false : true;

    if (colorData.data) {
      showColors(colorData.data)
    }

  }
});

settingsColorOption.forEach(function (setting) {
  setting.onclick = function () {
    let colorOption = this.getAttribute("data-option");
    this.querySelector('.checkmark').classList.toggle('active');
    if(customColorOutput.includes(colorOption)){
      for (let i = customColorOutput.length - 1; i >= 0; i--) {
        if (customColorOutput[i] === colorOption) {
          customColorOutput.splice(i, 1);
        }
       }
    } else {
      customColorOutput.push(colorOption)
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
  "BASECOLOURPALETTES",
  "DAYSKYCOLOURS",
  "DAYSKYCOLOURS_FIRESTORM",
  "DAYSKYCOLOURS_GRAVSTORM",
  "DUSKSKYCOLOURS",
  "LEGACYBASECOLOURPALETTES",
  "NIGHTSKYCOLOURS",
  "SPACERARESKYCOLOURS",
  "SPACESKYCOLOURS",
  "WATERCOLOURS",
  "BARRENCOLOURPALETTES",
  "DEADCOLOURPALETTES",
  "FROZENCOLOURPALETTES",
  "FROZENHQCOLOURPALETTES",
  "LAVACOLOURPALETTES",
  "LUSHBUBBLESCOLOURPALETTE",
  "LUSHCOLOURPALETTES",
  "LUSHHQCOLOURPALETTE",
  "LUSHROOMACOLOURPALETTE",
  "LUSHROOMBCOLOURPALETTE",
  "LUSHULTRACOLOURPALETTES",
  "RADIOCOLOURPALETTES",
  "SCORCHCOLOURPALETTES",
  "SWAMPCOLOURPALETTES",
  "TOXICCOLOURPALETTES",
  "TOXICEGGSCOLOURPALETTES",
  "TOXICSPORESCOLOURPALETTES",
  "TOXICTENTACLESCOLOURPALETTES",
  "BEAMSCOLOURPALETTES",
  "BONESPIRECOLOURPALETTES",
  "CONTOURCOLOURPALETTES",
  "ELBUBBLECOLOURPALETTES",
  "FRACTCUBECOLOURPALETTES",
  "HEXAGONCOLOURPALETTES",
  "HOUDINIPROPSCOLOURPALETTES",
  "HYDROGARDENCOLOURPALETTES",
  "IRRISHELLSCOLOURPALETTES",
  "MSTRUCTCOLOURPALETTES",
  "SHARDSCOLOURPALETTES",
  "WIRECELLSCOLOURPALETTES"
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
  let title = `<div class="fileTitle">File: ${data.file}.EXML</div>`;
  outputElement.insertAdjacentHTML('beforeBegin', title);


  if (data.file === "WATERCOLOURS" || data.file === "SPACERARESKYCOLOURS" || data.file === "SPACESKYCOLOURS") {

    let list = data.Data.Property.Property;
    list = list.map((item) => {
      output += `
      <div class="block">
      <div class="colors">`;

      let colors = item.Property;
      let colorNum = 1;
      if (config.startIndexZero) {
        colorNum = 0;
      };
      colors.map((color) => {
        let colorName = color._name;
        let R = color.Property[0]._value;
        let G = color.Property[1]._value;
        let B = color.Property[2]._value;
        let A = color.Property[3]._value;
        R = Math.round(R * 255);
        G = Math.round(G * 255);
        B = Math.round(B * 255);
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

      let customColorHtml = "";
      let customColors = {};

      list = list.map((item) => {
        output += `
        <div class="block">
        <div class="colors">`;
  
        let colors = item.Property;
        let colorNum = 1;
        if (config.startIndexZero) {
          colorNum = 0;
        };
        
        colors.map((color) => {
          
          let colorName = color._name;

          if(colorName !== "SkyGradientSpeed"){            
            let R = color.Property[0]._value;
            let G = color.Property[1]._value;
            let B = color.Property[2]._value;
            let A = color.Property[3]._value;
            R = Math.round(R * 255);
            G = Math.round(G * 255);
            B = Math.round(B * 255);
            let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
            let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
            //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
            //Color('rgb(255, 255, 255)')
    
            let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
            output += `<div class="colorline">
            <span class="name" style="background-color:${bgcolor}">${colorName}</span>
            <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
            </div>`;

            if(customColorOutput.includes(colorName)){
              if(!customColors[colorName]){
                customColors[colorName] = [];
              }
              customColors[colorName].push(bgcolor)
            }
          }

          colorNum = colorNum + 1;
        });
        output += `</div></div>`;
        
        
      });

      let customColorNum = 1;
      if (config.startIndexZero) {
        customColorNum = 0;
      };

      customColorHtml += `<div class="custom-colors-output">`;

      Object.keys(customColors).forEach(function(colors) {
        customColorHtml += `<div class="block">
        <div class="title">${colors}</div>
        <div class="colorblock">`;
        for (let index = 0; index < customColors[colors].length; index++) {
          const color = customColors[colors][index];
          customColorHtml+= `<span class="color" style="background-color:${color}">${index + customColorNum}</span>`;
        }
        customColorHtml += `</div></div>`;
      });

      customColorHtml += `</div>`

      output += customColorHtml;

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

              customColorHtml = "";
              customColors = {};

              output += `<div class="group-title 1">${groupName}</div>`;
              output += `
              <div class="block">
              <div class="colors">`;
  
              let colorNum = 1;
              if (config.startIndexZero) {
                colorNum = 0;
              };
              let colors = item.Property.Property.Property
              colors.map((color) => {
                let colorName = color._name;
                if(colorName !== "SkyGradientSpeed"){
                  let R = color.Property[0]._value;
                  let G = color.Property[1]._value;
                  let B = color.Property[2]._value;
                  let A = color.Property[3]._value;
                  R = Math.round(R * 255);
                  G = Math.round(G * 255);
                  B = Math.round(B * 255);
                  let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
                  let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
                  //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
                  //Color('rgb(255, 255, 255)')
    
                  let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
                  output += `<div class="colorline" style="background-color:grey">
                  <span class="name" style="background-color:${bgcolor}">${colorName}</span>
                  <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
                  </div>`;
                  if(customColorOutput.includes(colorName)){
                    if(!customColors[colorName]){
                      customColors[colorName] = [];
                    }
                    customColors[colorName].push(bgcolor)
                  }
                }
                colorNum = colorNum + 1;
              });
              
              output += `</div></div>`;

              let customColorNum = 1;
              if (config.startIndexZero) {
                customColorNum = 0;
              };

              customColorHtml += `<div class="custom-colors-output">`;

              Object.keys(customColors).forEach(function(colors) {
                let numOfColors = customColors[colors].length;
                let style = "";
                if(numOfColors <= 11){
                  style = `style="grid-template-columns: repeat(11, 1fr);"`;
                }
                customColorHtml += `<div class="block">
                <div class="title">${colors}</div>
                <div class="colorblock" ${style}>`;
                for (let index = 0; index < customColors[colors].length; index++) {
                  const color = customColors[colors][index];
                  customColorHtml+= `<span class="color" style="background-color:${color}">${index +customColorNum}</span>`;
                }
                customColorHtml += `</div></div>`;
              });
        
              customColorHtml += `</div>`
        
              output += customColorHtml;
            }
          }
        }
  
        if(types){
  
          output += `<div class="group-title 2">${groupName}</div>`;

          customColorHtml = "";
          customColors = {};

          types.map((type) => {

            output += `
            <div class="block">
            <div class="colors">`;
  
            let colorNum = 1;
            if (config.startIndexZero) {
              colorNum = 0;
            };
            let colors = type.Property;
            colors.map((color) => {
              let colorName = color._name;
              if(colorName !== "SkyGradientSpeed"){
                let R = color.Property[0]._value;
                let G = color.Property[1]._value;
                let B = color.Property[2]._value;
                let A = color.Property[3]._value;
                R = Math.round(R * 255);
                G = Math.round(G * 255);
                B = Math.round(B * 255);
                let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
                let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
                //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
                //Color('rgb(255, 255, 255)')
    
                let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
                output += `<div class="colorline">
                <span class="name" style="background-color:${bgcolor}">${colorName}</span>
                <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
                </div>`;
                if(customColorOutput.includes(colorName)){
                  if(!customColors[colorName]){
                    customColors[colorName] = [];
                  }
                  customColors[colorName].push(bgcolor)
                }
              }
              colorNum = colorNum + 1;
            });
            output += `</div></div>`;

          });

          let customColorNum = 1;
          if (config.startIndexZero) {
            customColorNum = 0;
          };

          customColorHtml += `<div class="custom-colors-output">`;

          Object.keys(customColors).forEach(function(colors) {
            let numOfColors = customColors[colors].length;
            let style = "";
            if(numOfColors <= 11){
              style = `style="grid-template-columns: repeat(11, 1fr);"`;
            }
            customColorHtml += `<div class="block">
            <div class="title">${colors}</div>
            <div class="colorblock" ${style}>`;
            for (let index = 0; index < customColors[colors].length; index++) {
              const color = customColors[colors][index];
              customColorHtml+= `<span class="color" style="background-color:${color}">${index + customColorNum}</span>`;
            }
            customColorHtml += `</div></div>`;
          });
    
          customColorHtml += `</div>`
    
          output += customColorHtml;
          
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
      colorNum = 0;
    };
    colors.map((color) => {
      let colorName = color._name;
      if(colorName !== "SkyGradientSpeed"){
        let R = color.Property[0]._value;
        let G = color.Property[1]._value;
        let B = color.Property[2]._value;
        let A = color.Property[3]._value;
        R = Math.round(R * 255);
        G = Math.round(G * 255);
        B = Math.round(B * 255);
        let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
        let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
        //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
        //Color('rgb(255, 255, 255)')

        let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
        output += `<div class="colorline">
        <span class="name" style="background-color:${bgcolor}">${colorName}</span>
        <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
        </div>`;
      }
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
              colorNum = 0;
            };
            let colors = item.Property.Property.Property
            colors.map((color) => {
              let colorName = color._name;
              if(colorName !== "SkyGradientSpeed"){
                let R = color.Property[0]._value;
                let G = color.Property[1]._value;
                let B = color.Property[2]._value;
                let A = color.Property[3]._value;
                R = Math.round(R * 255);
                G = Math.round(G * 255);
                B = Math.round(B * 255);
                let tColor = `rgba(${R}, ${G}, ${B}, ${A})`;
                let darkerColor = tinycolor(tColor).desaturate(20).toHexString();
                //let lightColor = Color('rgb(${R}, ${G}, ${B})').lighten(0.5);
                //Color('rgb(255, 255, 255)')

                let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
                output += `<div class="colorline" style="background-color:grey">
                <span class="name" style="background-color:${bgcolor}">${colorName}</span>
                <span class="color" style="background-color:${bgcolor}">${colorNum}</span>
                </div>`;
              }
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
            colorNum = 0;
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
      let paletteOutput = "";
      let hidePalette = 0;
      paletteOutput += `
      <div class="block">
      <div class="title">${item._name}</div>
      <div class="colorblock" style="grid-template-columns: repeat(${colorsPerLine}, 1fr);">`;

      let colors = item.Property[1].Property;
      let colorNum = 1;
      if (config.startIndexZero) {
        colorNum = 0;
      };
      colors.map((color) => {
        let R = color.Property[0]._value;
        let G = color.Property[1]._value;
        let B = color.Property[2]._value;
        let A = color.Property[3]._value;
        R = R * 255;
        G = G * 255;
        B = B * 255;
        R = Math.round(R);
        G = Math.round(G);
        B = Math.round(B);

        if((R === 255 && G === 255 && B === 255 && A === 255) || R <= 4 && G <= 6 && B <= 4 && A === 255){
          hidePalette = hidePalette +1;
        }

        let bgcolor = `rgba(${R}, ${G}, ${B}, ${A})`;
        paletteOutput += `<span class="color" style="background-color:${bgcolor}">${colorNum}</span>`;
        colorNum = colorNum + 1;
      });
      paletteOutput += `</div></div>`;

      if(hidePalette <= 64 && config.hideWhitePalettes === true){
        output += paletteOutput;
      } else if(hidePalette < 64 && config.hideWhitePalettes === false){
        output += paletteOutput;
      }
    });
  }



  //$('.output').html(output);
  outputElement.classList.remove("hidden");
  inputElement.classList.add("hidden");
  document.querySelector('.output').innerHTML = output;
  tippy('[data-tippy-content]');
}