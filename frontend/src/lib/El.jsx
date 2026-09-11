import React, { useState } from "react";
import { cssToObj, mergeStyle } from "./style.js";

/**
 * Renders `as` (default "div") with a base style (css string or object),
 * merging in `hoverStyle` while hovered and `focusStyle` while focused —
 * mirroring the `style` / `style-hover` / `style-focus` attributes used in
 * the original template.
 */
export default function El({ as = "div", style, hoverStyle, focusStyle, children, ...rest }) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const Tag = as;

  const computed = mergeStyle(
    style,
    hover && hoverStyle ? hoverStyle : null,
    focus && focusStyle ? focusStyle : null
  );

  const handlers = {};
  if (hoverStyle) {
    handlers.onMouseEnter = (e) => {
      setHover(true);
      rest.onMouseEnter?.(e);
    };
    handlers.onMouseLeave = (e) => {
      setHover(false);
      rest.onMouseLeave?.(e);
    };
  }
  if (focusStyle) {
    handlers.onFocus = (e) => {
      setFocus(true);
      rest.onFocus?.(e);
    };
    handlers.onBlur = (e) => {
      setFocus(false);
      rest.onBlur?.(e);
    };
  }

  return (
    <Tag {...rest} {...handlers} style={computed}>
      {children}
    </Tag>
  );
}

export { cssToObj };
