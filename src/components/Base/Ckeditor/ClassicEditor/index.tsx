import "@/assets/css/vendors/ckeditor.css";
import { createRef, useEffect, useRef, useMemo } from "react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { init, updateData, CkeditorProps, CkeditorElement } from "../ckeditor";

function Ckeditor<C extends React.ElementType = "div">({
  disabled = false,
  config = {},
  value = "",
  onChange = () => {},
  onFocus = () => {},
  onBlur = () => {},
  onReady = () => {},
  getRef = () => {},
  className,
  as,
  ...computedProps
}: CkeditorProps<C>) {
  const editorRef = createRef<CkeditorElement>();
  const cacheData = useRef("");
  const initialRender = useRef(true);
  const isInitializing = useRef(false);

  // Memoize props untuk menghindari re-render yang tidak perlu
  const props = useMemo(() => ({
    disabled,
    config,
    value,
    onChange,
    onFocus,
    onBlur,
    onReady,
    getRef,
  }), [disabled, config, value, onChange, onFocus, onBlur, onReady, getRef]);

  // Initialize CKEditor
  useEffect(() => {
    if (!editorRef.current || isInitializing.current) return;

    const element = editorRef.current;
    isInitializing.current = true;

    // Call getRef callback
    if (props.getRef) {
      props.getRef(element);
    }

    // Initialize editor
    init(element, ClassicEditor, { props, cacheData })
      .then(() => {
        initialRender.current = false;
        isInitializing.current = false;
      })
      .catch((error) => {
        console.error("CKEditor initialization error:", error);
        isInitializing.current = false;
      });

    // Cleanup function
    return () => {
      if (element.CKEditor) {
        element.CKEditor.destroy()
          .catch((error: any) => {
            console.error("CKEditor destroy error:", error);
          });
        element.CKEditor = null;
      }
      isInitializing.current = false;
    };
  }, []); // Hanya run sekali saat mount

  // Update editor data ketika value berubah
  useEffect(() => {
    if (!initialRender.current && editorRef.current?.CKEditor) {
      updateData(editorRef.current, { props, cacheData });
    }
  }, [props.value]);

  // Update disabled state
  useEffect(() => {
    if (!initialRender.current && editorRef.current?.CKEditor) {
      if (props.disabled) {
        editorRef.current.CKEditor.enableReadOnlyMode("ckeditor");
      } else {
        editorRef.current.CKEditor.disableReadOnlyMode("ckeditor");
      }
    }
  }, [props.disabled]);

  const Component = as || "div";

  return (
    <Component
      {...computedProps}
      ref={editorRef}
      className={className}
    />
  );
}

export default Ckeditor;
