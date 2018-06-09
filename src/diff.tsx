import * as monaco from "monaco-editor";
import * as React from "react";
import { getSize } from "./common";
import { EditorPropsBase } from "./types";

interface PropsBase extends EditorPropsBase {
	original?: string;
	language: string;

	editorDidMount?(editor: monaco.editor.IStandaloneDiffEditor, context: typeof monaco): void;
	onChange?(value: string): void;
}
interface PropsUncontrolled extends PropsBase {
	value: undefined;
	defaultValue: string;
}
interface PropsControlled extends PropsBase {
	defaultValue: undefined;
	value: string;
}
type Props = PropsControlled | PropsUncontrolled;

export class MonacoDiffEditor extends React.Component<Props> {
	static defaultProps = {
		width: "100%",
		height: "100%",
		original: undefined,
		value: undefined,
		defaultValue: "",
		language: "javascript",
		theme: "vs",
		options: {},
		editorDidMount: undefined,
		editorWillMount: undefined,
		onChange: undefined
	};

	private _currentValue: string;
	private _currentOriginal: string;
	private _preventTriggerChangeEvent: boolean = false;

	private containerElement: React.RefObject<HTMLDivElement>;
	private editor: monaco.editor.IStandaloneDiffEditor | undefined;

	constructor(props: Partial<Props>) {
		super(props as Props);
		this.containerElement = React.createRef<HTMLDivElement>();
		this._currentValue = props.value || "";
		this._currentOriginal = props.original || "";
	}

	componentDidMount() {
		this.initMonaco();
	}

	componentDidUpdate(prevProps: Props) {
		if (
			this.props.value !== this._currentValue ||
			this.props.original !== this._currentOriginal
		) {
			// Always refer to the latest value
			this._currentValue = this.props.value || "";
			this._currentOriginal = this.props.original || "";
			// Consider the situation of rendering 1+ times before the editor mounted
			if (this.editor) {
				this._preventTriggerChangeEvent = true;
				this.updateModel(this._currentValue, this._currentOriginal);
				this._preventTriggerChangeEvent = false;
			}
		}
		const e = this.editor;
		if (e && prevProps.language !== this.props.language) {
			const { original, modified } = e.getModel();
			monaco.editor.setModelLanguage(original, this.props.language);
			monaco.editor.setModelLanguage(modified, this.props.language);
		}
		if (prevProps.theme !== this.props.theme) {
			monaco.editor.setTheme(this.props.theme);
		}
		if (
			e &&
			(this.props.width !== prevProps.width || this.props.height !== prevProps.height)
		) {
			e.layout();
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

	editorDidMount(editor: monaco.editor.IStandaloneDiffEditor) {
		const { editorDidMount } = this.props;
		if (editorDidMount) {
			editorDidMount(editor, monaco);
		}

		editor.onDidUpdateDiff(() => {
			const value = editor.getModel().modified.getValue();

			// Always refer to the latest value
			this._currentValue = value;

			const onChange = this.props.onChange;
			// Only invoking when user input changed
			if (onChange && !this._preventTriggerChangeEvent) {
				onChange(value);
			}
		});
	}

	updateModel(modifiedValue: string, originalValue: string) {
		const { language } = this.props;
		const original = monaco.editor.createModel(originalValue, language);
		const modified = monaco.editor.createModel(modifiedValue, language);

		const e = this.editor;
		if (e) {
			e.setModel({ original, modified });
		}
	}

	initMonaco() {
		const value = (!!this.props.value ? this.props.value : this.props.defaultValue);
		const { original, theme, options } = this.props;
		const container = this.containerElement.current
		if (container) {
			// Before initializing monaco editor
			this.editorWillMount();

			this.editor = monaco.editor.createDiffEditor(container, options);

			if (theme) {
				monaco.editor.setTheme(theme);
			}

			// After initializing monaco editor
			this.updateModel(
				value || "",
				original || "",
			);
			this.editorDidMount(this.editor);
		}
	}

	destroyMonaco() {
		const e = this.editor; // defensive reference copy to prevent races
		if (e !== undefined) {
			e.dispose();
		}
	}
	render() {
		const style = getSize(this.props);

		return <div ref={this.containerElement} style={style} className="react-monaco-editor-container" />;
	}
}
