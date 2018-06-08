import { EditorPropsBase } from "./types";


export const getSize = (props: EditorPropsBase) => {
	const { width, height } = props;
	return {
		height: typeof height !== "number" && height.indexOf("%") ? height : `${height}px`,
		width: typeof width !== "number" && width.indexOf("%") ? width : `${width}px`,
	};
}
