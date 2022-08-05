import * as RGL_UTILS from "react-grid-layout/build/utils";
import {
  sortLayoutItems,
  getLayoutItem,
  cloneLayoutItem,
  validateLayout,
  correctBounds,
  getAllCollisions,
  bottom,
} from "react-grid-layout/build/utils";

var isProduction = process.env.NODE_ENV === "production";
var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2
      ? ownKeys(Object(source), !0).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(
          target,
          Object.getOwnPropertyDescriptors(source)
        )
      : ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(
            target,
            key,
            Object.getOwnPropertyDescriptor(source, key)
          );
        });
  }
  return target;
}

function getStatics(
  layout
  /*: Layout*/
) {
  /*: Array<LayoutItem>*/
  return layout.filter(function (l) {
    return l.static;
  });
}

function compact(
  layout,
  /*: Layout*/
  compactType,
  /*: CompactType*/
  cols
  /*: number*/
) {
  /*: Layout*/
  // Statics go in the compareWith array right away so items flow around them.
  var compareWith = getStatics(layout); // We go through the items by row and column.

  var sorted = sortLayoutItems(layout, compactType); // Holding for new items.

  var out = Array(layout.length);

  for (var i = 0, len = sorted.length; i < len; i++) {
    var l = cloneLayoutItem(sorted[i]); // Don't move static elements

    if (!l.static) {
      l = compactItem(compareWith, l, compactType, cols, sorted); // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.

      compareWith.push(l);
    } // Add to output array to make sure they still come out in the right order.

    out[layout.indexOf(sorted[i])] = l; // Clear moved flag, if it exists.

    l.moved = false;
  }

  return out;
}

var heightWidth = {
  x: "w",
  y: "h",
};

function resolveCompactionCollision(
  layout,
  /*: Layout*/
  item,
  /*: LayoutItem*/
  moveToCoord,
  /*: number*/
  axis
  /*: "x" | "y"*/
) {
  var sizeProp = heightWidth[axis];
  item[axis] += 1;
  var itemIndex = layout
    .map(function (layoutItem) {
      return layoutItem.i;
    })
    .indexOf(item.i); // Go through each item we collide with.

  for (var i = itemIndex + 1; i < layout.length; i++) {
    var otherItem = layout[i]; // Ignore static items

    if (otherItem.static) continue; // Optimization: we can break early if we know we're past this el
    // We can do this b/c it's a sorted layout

    if (otherItem.y > item.y + item.h) break;

    if (collides(item, otherItem)) {
      resolveCompactionCollision(
        layout,
        otherItem,
        moveToCoord + item[sizeProp],
        axis
      );
    }
  }

  item[axis] = moveToCoord;
}

function compactItem(
  compareWith,
  /*: Layout*/
  l,
  /*: LayoutItem*/
  compactType,
  /*: CompactType*/
  cols,
  /*: number*/
  fullLayout
  /*: Layout*/
) {
  /*: LayoutItem*/
  var compactV = compactType === "vertical";
  var compactH = compactType === "horizontal";

  if (compactV) {
    // Bottom 'y' possible is the bottom of the layout.
    // This allows you to do nice stuff like specify {y: Infinity}
    // This is here because the layout must be sorted in order to get the correct bottom `y`.
    l.y = Math.min(bottom(compareWith), l.y); // Move the element up as far as it can go without colliding.

    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  } else if (compactH) {
    // Move the element left as far as it can go without colliding.
    while (l.x > 0 && !getFirstCollision(compareWith, l)) {
      l.x--;
    }
  } // Move it down, and keep moving it down if it's colliding.

  var collides;

  while ((collides = getFirstCollision(compareWith, l))) {
    if (compactH) {
      resolveCompactionCollision(fullLayout, l, collides.x + collides.w, "x");
    } else {
      resolveCompactionCollision(fullLayout, l, collides.y + collides.h, "y");
    } // Since we can't grow without bounds horizontally, if we've overflown, let's move it down and try again.

    if (compactH && l.x + l.w > cols) {
      l.x = cols - l.w;
      l.y++;
    }
  } // Ensure that there are no negative positions

  l.y = Math.max(l.y, 0);
  l.x = Math.max(l.x, 0);
  return l;
}

function getFirstCollision(
  layout,
  /*: Layout*/
  layoutItem
  /*: LayoutItem*/
) {
  /*: ?LayoutItem*/
  for (var i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) return layout[i];
  }
}

function collides(
  l1,
  /*: LayoutItem*/
  l2
  /*: LayoutItem*/
) {
  /*: boolean*/
  if (l1.i === l2.i) return false; // same element

  if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2

  if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2

  if (l1.y + l1.h <= l2.y) return false; // l1 is above l2

  if (l1.y >= l2.y + l2.h) return false; // l1 is below l2

  return true; // boxes overlap
}

RGL_UTILS.compact = function compact(layout, compactType, cols) {
  // We go through the items by row and column.
  const sorted = sortLayoutItems(layout, "vertical");
  // Holding for new items.
  const out = Array(layout.length);

  for (let i = 0, len = sorted.length; i < len; i++) {
    let l = cloneLayoutItem(sorted[i]);

    // Don't move static elements
    if (!l.static) {
      l.y = Math.floor(i / cols);
      l.x = i % cols;
    }
    // Add to output array to make sure they still come out in the right order.
    out[i] = l;
    // Clear moved flag, if it exists.
    l.moved = false;
  }
  return out;
};

RGL_UTILS.synchronizeLayoutWithChildren =
  function synchronizeLayoutWithChildren(
    initialLayout,
    children,
    /*: ReactChildren*/
    cols,
    /*: number*/
    compactType,
    /*: CompactType*/
    allowOverlap
    /*: ?boolean*/
  ) {
    initialLayout = initialLayout || []; // Generate one layout item per child.

    var layout =
      /*: LayoutItem[]*/
      [];

    _react.default.Children.forEach(
      children,
      function (
        child
        /*: ReactElement<any>*/
      ) {
        // Child may not exist
        if ((child === null || child === void 0 ? void 0 : child.key) == null)
          return; // Don't overwrite if it already exists.

        var exists = getLayoutItem(initialLayout, String(child.key));

        if (exists) {
          layout.push(cloneLayoutItem(exists));
        } else {
          if (!isProduction && child.props._grid) {
            console.warn(
              "`_grid` properties on children have been deprecated as of React 15.2. " +
                "Please use `data-grid` or add your properties directly to the `layout`."
            );
          }

          var g = child.props["data-grid"] || child.props._grid; // Hey, this item has a data-grid property, use it.

          if (g) {
            if (!isProduction) {
              validateLayout([g], "ReactGridLayout.children");
            } // FIXME clone not really necessary here

            layout.push(
              cloneLayoutItem(
                _objectSpread(
                  _objectSpread({}, g),
                  {},
                  {
                    i: child.key,
                  }
                )
              )
            );
          } else {
            // Nothing provided: ensure this is added to the bottom
            // FIXME clone not really necessary here
            layout.push(
              cloneLayoutItem({
                w: 1,
                h: 1,
                x: 0,
                y: bottom(layout),
                i: String(child.key),
              })
            );
          }
        }
      }
    ); // Correct the layout.

    var correctedLayout = correctBounds(layout, {
      cols: cols,
    });
    return allowOverlap
      ? correctedLayout
      : compact(correctedLayout, compactType, cols);
  };

RGL_UTILS.moveElement = (
  layout,
  l,
  x,
  y,
  isUserAction,
  preventCollision,
  compactType,
  cols,
  isLeftShift // overriden - nitesh
) => {
  // If this is static and not explicitly enabled as draggable,
  // no move is possible, so we can short-circuit this immediately.
  if (l.static && l.isDraggable !== true) return layout;

  // Short-circuit if nothing to do.
  if (l.y === y && l.x === x) return layout;

  const oldX = l.x;
  const oldY = l.y;

  // This is quite a bit faster than extending the object
  if (typeof x === "number") l.x = x;
  if (typeof y === "number") l.y = y;
  l.moved = true;

  // If this collides with anything, move it.
  // When doing this comparison, we have to sort the items we compare with
  // to ensure, in the case of multiple collisions, that we're getting the
  // nearest collision.
  let sorted = sortLayoutItems(layout, compactType);
  const movingUp =
    compactType === "vertical" && typeof y === "number"
      ? oldY >= y
      : compactType === "horizontal" && typeof x === "number"
      ? oldX >= x
      : false;
  if (movingUp) sorted = sorted.reverse();
  const collisions = getAllCollisions(sorted, l);

  // There was a collision; abort
  if (preventCollision && collisions.length) {
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout;
  }
  // overriden - nitesh
  if (isUserAction) {
    isUserAction = false;
    if (oldX === x) isLeftShift = oldY - y <= 0;
    if (oldY === y) isLeftShift = oldX - x <= 0;
  }
  // Move each item that collides away from this element.
  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i];

    // Short circuit so we can't infinite loop
    if (collision.moved) continue;

    // Don't move static items - we have to move *this* element away
    if (collision.static) {
      layout = RGL_UTILS.moveElementAwayFromCollision(
        layout,
        collision,
        l,
        isUserAction,
        compactType,
        cols,
        isLeftShift // overriden - nitesh
      );
    } else {
      layout = RGL_UTILS.moveElementAwayFromCollision(
        layout,
        l,
        collision,
        isUserAction,
        compactType,
        cols,
        isLeftShift // overriden - nitesh
      );
    }
  }

  return layout;
};

RGL_UTILS.moveElementAwayFromCollision = function moveElementAwayFromCollision(
  layout,
  collidesWith,
  itemToMove,
  isUserAction,
  compactType,
  cols,
  isLeftShift
) {
  const compactH = compactType === "horizontal";

  const preventCollision = collidesWith.static; // we're already colliding (not for static items)
  const isTileWrapping = isLeftShift
    ? itemToMove.x - 1 < 0
    : itemToMove.x + 1 >= cols;
  const deltaShift = isLeftShift ? -1 : 1;
  const x = isTileWrapping
    ? isLeftShift
      ? cols - 1
      : 0
    : itemToMove.x + deltaShift;
  const y = isTileWrapping ? itemToMove.y + deltaShift : itemToMove.y;

  return RGL_UTILS.moveElement(
    layout,
    itemToMove,
    compactH ? x : undefined,
    y,
    isUserAction,
    preventCollision,
    compactType,
    cols,
    isLeftShift
  );
};
