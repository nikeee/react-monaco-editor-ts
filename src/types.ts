import * as monaco from "monaco-editor";

export interface EditorPropsBase {
	width: number | string;
	height: number | string;

	theme: string;

	options?: monaco.editor.IEditorOverrideServices;
	editorWillMount?(context: typeof monaco): void;
}
