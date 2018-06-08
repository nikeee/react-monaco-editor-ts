import * as monaco from 'monaco-editor';
import React from 'react';
import PropTypes from 'prop-types';

interface Props {
  width?: number | string;
  height?: number | string;

  original?: string;
  value?: string;
  defaultValue?: string;
  language: string;

  theme?: string; // TODO narrow type?

  options?: monaco.editor.IEditorOverrideServices;

  editorDidMount?(editor: monaco.editor.IStandaloneDiffEditor, context: typeof monaco): void;
  editorWillMount?(context: typeof monaco): void;
  onChange?(value: string): void;
}
interface State {

}

export class MonacoDiffEditor extends React.Component<Props, State> {
  private _currentValue: string;
  private _currentOriginal: string;
  private _preventTriggerChangeEvent: boolean = false;

  private containerElement: React.RefObject<HTMLDivElement>;
  private editor: monaco.editor.IStandaloneDiffEditor | undefined;

  constructor(props) {
    super(props);
    this.containerElement = React.createRef<HTMLDivElement>();
    this._currentValue = props.value;
    this._currentOriginal = props.original;
  }

  componentDidMount() {
    this.initMonaco();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.value !== this._currentValue ||
      this.props.original !== this._currentOriginal
    ) {
      // Always refer to the latest value
      this._currentValue = this.props.value;
      this._currentOriginal = this.props.original;
      // Consider the situation of rendering 1+ times before the editor mounted
      if (this.editor) {
        this._preventTriggerChangeEvent = true;
        this.updateModel(this._currentValue, this._currentOriginal);
        this._preventTriggerChangeEvent = false;
      }
    }
    if (prevProps.language !== this.props.language) {
      const { original, modified } = this.editor.getModel();
      monaco.editor.setModelLanguage(original, this.props.language);
      monaco.editor.setModelLanguage(modified, this.props.language);
    }
    if (prevProps.theme !== this.props.theme) {
      monaco.editor.setTheme(this.props.theme);
    }
    if (
      this.editor &&
      (this.props.width !== prevProps.width || this.props.height !== prevProps.height)
    ) {
      this.editor.layout();
    }
  }

  componentWillUnmount() {
    this.destroyMonaco();
  }

  editorWillMount() {
    const { editorWillMount } = this.props;
    if (editorWillMount) {
      editorWillMount(monaco);
    }
  }

  editorDidMount(editor) {
    this.props.editorDidMount(editor, monaco);
    editor.onDidUpdateDiff(() => {
      const value = editor.getModel().modified.getValue();

      // Always refer to the latest value
      this._currentValue = value;

      // Only invoking when user input changed
      if (!this._preventTriggerChangeEvent) {
        this.props.onChange(value);
      }
    });
  }

  updateModel(value, original) {
    const { language } = this.props;
    const originalModel = monaco.editor.createModel(original, language);
    const modifiedModel = monaco.editor.createModel(value, language);
    this.editor.setModel({
      original: originalModel,
      modified: modifiedModel
    });
  }

  initMonaco() {
    const value = this.props.value !== null ? this.props.value : this.props.defaultValue;
    const { original, theme, options } = this.props;
    if (this.containerElement) {
      // Before initializing monaco editor
      this.editorWillMount();
      this.editor = monaco.editor.createDiffEditor(this.containerElement.current, options);
      if (theme) {
        monaco.editor.setTheme(theme);
      }
      // After initializing monaco editor
      this.updateModel(value, original);
      this.editorDidMount(this.editor);
    }
  }

  destroyMonaco() {
    if (this.editor !== undefined) {
      this.editor.dispose();
    }
  }

  render() {
    const { width, height } = this.props;
    const fixedWidth = width.toString().indexOf('%') !== -1 ? width : `${width}px`;
    const fixedHeight = height.toString().indexOf('%') !== -1 ? height : `${height}px`;
    const style = {
      width: fixedWidth,
      height: fixedHeight
    };

    return <div ref={this.containerElement} style={style} className="react-monaco-editor-container" />;
  }
}

MonacoDiffEditor.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  original: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  language: PropTypes.string,
  theme: PropTypes.string,
  options: PropTypes.object,
  editorDidMount: PropTypes.func,
  editorWillMount: PropTypes.func,
  onChange: PropTypes.func
};

MonacoDiffEditor.defaultProps = {
  width: '100%',
  height: '100%',
  original: null,
  value: null,
  defaultValue: '',
  language: 'javascript',
  theme: null,
  options: {},
  editorDidMount: noop,
  editorWillMount: noop,
  onChange: noop
};
