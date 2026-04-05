import noStyleProp from './rules/no-style-prop.mjs'
import noNestedDivs from './rules/no-nested-divs.mjs'
import noComplexJsxMap from './rules/no-complex-jsx-map.mjs'
import preferNoUseEffect from './rules/prefer-no-use-effect.mjs'
import noJsxValueCalculations from './rules/no-jsx-value-calculations.mjs'
import jsxPropLayout from './rules/jsx-prop-layout.mjs'


export const rules = {
                       'no-style-prop':             noStyleProp,
                       'no-nested-divs':            noNestedDivs,
                       'no-complex-jsx-map':        noComplexJsxMap,
                       'prefer-no-use-effect':      preferNoUseEffect,
                       'no-jsx-value-calculations': noJsxValueCalculations,
                       'jsx-prop-layout':           jsxPropLayout,
                     }


export default { rules }
