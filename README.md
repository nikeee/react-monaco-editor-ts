# react-monaco-editor-ts

> [Monaco Editor](https://github.com/Microsoft/monaco-editor) for React.

This is a hard-fork of [react-monaco-editor](https://travis-ci.org/superRaytin/react-monaco-editor).

## Examples

To build the examples locally, run:

```bash
npm
cd example
npm
npm start
```

Then open `http://localhost:8886` in a browser.

## Installation

```bash
npm i -S react-monaco-editor-ts
```

## Using with Webpack

```js
import React from 'react';
import { render } from 'react-dom';
import MonacoEditor from 'react-monaco-editor';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: '// type your code...',
    }
  }
  editorDidMount(editor, monaco) {
    console.log('editorDidMount', editor);
    editor.focus();
  }
  onChange(newValue, e) {
    console.log('onChange', newValue, e);
  }
  render() {
    const code = this.state.code;
    const options = {
      selectOnLineNumbers: true
    };
    return (
      <MonacoEditor
        width="800"
        height="600"
        language="javascript"
        theme="vs-dark"
        value={code}
        options={options}
        onChange={::this.onChange}
        editorDidMount={::this.editorDidMount}
      />
    );
  }
}

render(
  <App />,
  document.getElementById('root')
);
```

Add the [Monaco Webpack plugin](https://github.com/Microsoft/monaco-editor-webpack-plugin) `monaco-editor-webpack-plugin` to your `webpack.config.js`:

```js
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
module.exports = {
  plugins: [
    new MonacoWebpackPlugin()
  ]
};
```

## Properties

If you specify `value` property, the component behaves in controlled mode.
Otherwise, it behaves in uncontrolled mode.

- `width` width of editor. Defaults to `100%`.
- `height` height of editor. Defaults to `100%`.
- `value` value of the auto created model in the editor.
- `defaultValue` the initial value of the auto created model in the editor.
- `language` the initial language of the auto created model in the editor.
- `theme` the theme of the editor
- `options` refer to [Monaco interface IEditorConstructionOptions](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html).
- `onChange(newValue, event)` an event emitted when the content of the current model has changed.
- `editorWillMount(monaco)` an event emitted before the editor mounted (similar to `componentWillMount` of React).
- `editorDidMount(editor, monaco)` an event emitted when the editor has been mounted (similar to `componentDidMount` of React).
- `context` optional, allow to pass a different context then the global window onto which the monaco instance will be loaded. Useful if you want to load the editor in an iframe.

## Events & Methods

Refer to [Monaco interface IEditor](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditor.html).

## Q & A

### How to interact with the MonacoEditor instance

Using the first parameter of `editorDidMount`, or using a `ref` (e.g. `<MonacoEditor ref="monaco">`) after `editorDidMount` event has fired.

Then you can invoke instance methods via `this.refs.monaco.editor`, e.g. `this.refs.monaco.editor.focus()` to focuses the MonacoEditor instance.

### How to get value of editor

Using `this.refs.monaco.editor.getValue()` or via method of `Model` instance:

```js
const model = this.refs.monaco.editor.getModel();
const value = model.getValue();
```

### Do something before editor mounted

For example, you may want to configure some JSON schemas before editor mounted, then you can go with `editorWillMount(monaco)`:

```js
class App extends React.Component {
    editorWillMount(monaco) {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            schemas: [{
                uri: "http://myserver/foo-schema.json",
                schema: {
                    type: "object",
                    properties: {
                        p1: {
                            enum: [ "v1", "v2"]
                        },
                        p2: {
                            $ref: "http://myserver/bar-schema.json"
                        }
                    }
                }
            }]
        });
    }
    render() {
        return (
          <MonacoEditor language="json" editorWillMount={this.editorWillMount} />
        );
    }
}
```

### Use multiple themes

[Monaco only supports one theme](https://github.com/Microsoft/monaco-editor/issues/338).

### How to use the diff editor

```js
import React from 'react';
import { MonacoDiffEditor } from 'react-monaco-editor';

class App extends React.Component {
  render() {
    const code1 = "// your original code...";
    const code2 = "// a different version...";
    const options = {
      //renderSideBySide: false
    };
    return (
      <MonacoDiffEditor
        width="800"
        height="600"
        language="javascript"
        original={code1}
        value={code2}
        options={options}
      />
    );
  }
}
```

# License

MIT, see the [LICENSE](/LICENSE.md) file for detail.
