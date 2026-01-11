import { MutableRefObject } from "react";

export interface CkeditorElement extends HTMLDivElement {
  CKEditor: any;
}

export type CkeditorProps<C extends React.ElementType> =
  PolymorphicComponentPropWithRef<
    C,
    {
      value: string;
      config?: any;
      disabled?: boolean;
      onChange: (data: any) => void;
      onFocus?: (evt: any, editor: any) => void;
      onBlur?: (evt: any, editor: any) => void;
      onReady?: (editor: any) => void;
      getRef?: (el: CkeditorElement) => void;
    }
  >;

const init = async <C extends React.ElementType>(
  el: CkeditorElement,
  editorBuild: any,
  {
    props,
    cacheData,
  }: {
    props: CkeditorProps<C>;
    cacheData: MutableRefObject<string>;
  }
) => {
  // Pastikan element masih ada
  if (!el || !el.isConnected) {
    return;
  }

  try {
    // Initial data
    cacheData.current = props.value;
    const editorConfig = {
      ...props.config,
      initialData: props.value,
    };

    // Init CKEditor
    const editor = await editorBuild.create(el, editorConfig);

    // Pastikan element masih ada setelah async operation
    if (!el.isConnected) {
      await editor.destroy().catch(() => {});
      return;
    }

    // Attach CKEditor instance
    el.CKEditor = editor;

    // Set initial disabled state
    if (props.disabled) {
      editor.enableReadOnlyMode("ckeditor");
    }

    // Set on change event
    editor.model.document.on("change:data", () => {
      const data = editor.getData();
      cacheData.current = data;
      props.onChange(data);
    });

    // Set on focus event
    editor.editing.view.document.on("focus", (evt: any) => {
      if (props.onFocus) {
        props.onFocus(evt, editor);
      }
    });

    // Set on blur event
    editor.editing.view.document.on("blur", (evt: any) => {
      if (props.onBlur) {
        props.onBlur(evt, editor);
      }
    });

    // Set on ready event
    if (props.onReady) {
      props.onReady(editor);
    }
  } catch (error) {
    console.error("CKEditor initialization failed:", error);
    throw error;
  }
};

// Watch model change
const updateData = <C extends React.ElementType>(
  el: CkeditorElement,
  {
    props,
    cacheData,
  }: {
    props: CkeditorProps<C>;
    cacheData: MutableRefObject<string>;
  }
) => {
  if (!el?.CKEditor || !el.isConnected) {
    return;
  }

  try {
    if (cacheData.current !== props.value) {
      el.CKEditor.setData(props.value);
      cacheData.current = props.value;
    }
  } catch (error) {
    console.error("CKEditor updateData failed:", error);
  }
};

export { init, updateData };
