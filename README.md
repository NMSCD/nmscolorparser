![](https://img.shields.io/github/release/nmscd/nmscolorparser.svg) ![](https://img.shields.io/github/issues/nmscd/nmscolorparser.svg)
### NMS Color Parser

[https://nmscd.github.io/nmscolorparser/](https://nmscd.github.io/nmscolorparser/)

This mini app reads the exml files and shows the colors of each property visually.
The number represents the index of that color in their parent property.

Example:

![](https://nmscd.github.io/nmscolorparser/src/img/sample.png)

#### Supported files:
- BASECOLOURPALETTES.EXML
- LEGACYBASECOLOURPALETTES.EXML

#### How to convert the color values of NMS properties:

```xml
<Property value="Colour.xml">
  <Property name="R" value="0.7839" />
  <Property name="G" value="0.41184" />
  <Property name="B" value="0.02691" />
  <Property name="A" value="1" />
</Property>
```
#### Multiply the value by 255 and round it.

```javascript
R = Math.round(0.7839 * 255); // result: 200
```
