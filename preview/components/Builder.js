'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Map } from 'immutable';

// The real components.js will be generated during build process
import components from '../components.js';

const pseudoComponents = new Set([
    'Text',
    'Outlet'
]);

const isPseudoComponent = component => pseudoComponents.has(component.name);

/**
 * Get component from UI library
 *
 * @param  {string} name - Name of React component
 * @return {Function} React component for render
 */
const getComponentByName = (name = '') => {
    const [namespace, componentName] = name.split('.');
    if (!namespace || !componentName) throw new Error(`Invalid component name: ${name}`);
    if (namespace === 'HTML') return componentName;
    if (!components[namespace]) throw new Error(`Namespace not found: ${namespace}`);
    const component = components[namespace][componentName];
    if (!component) throw new Error(`Component not found: ${name}`);
    return component;
};

/**
 * Props constructor by meta
 * @param  {Immutable.Map} props
 * @return {Object}
 */
const getProps = props => {
    const ret = {};

    props.keySeq().forEach(key => {
        const prop = props.get(key);

        if (prop.source == 'static') {
            ret[key] = prop.sourceData.value;
        }
        else if (prop.source === 'const') {
            if (typeof prop.sourceData.value !== 'undefined') {
                ret[key] = prop.sourceData.value;
            }
        }
    });

    return ret;
};

export default class Builder extends Component {
    constructor(props) {
        super(props);

        this._getComponentFromMeta = this._getComponentFromMeta.bind(this);
    }

    _renderPseudoComponent(component) {
        if (component.name === 'Outlet') {
            return this.props.children;
        }
        else if (component.name === 'Text') {
            const props = getProps(component.props);
            return props.text || '';
        }
    }

    _getComponentFromMeta(component) {
        if (!component) return null;

        if (isPseudoComponent(component))
            return this._renderPseudoComponent(component);

        const Component = getComponentByName(component.name);

        if (component.children.size > 0) {
            return (
                <Component
                    key={component.id}
                    data-id={component.id}
                    {...getProps(component.props)}
                >
                    {component.children.map(this._getComponentFromMeta)}
                </Component>
            );
        }
        else {
            return (
                <Component
                    key={component.id}
                    data-id={component.id}
                    {...getProps(component.props)}
                />
            );
        }
    }

    render() {
        return this._getComponentFromMeta(this.props.component);
    }
}

Builder.propTypes = {
    component: ImmutablePropTypes.contains({
        id: React.PropTypes.string,
        name: React.PropTypes.string,
        props: ImmutablePropTypes.map,
        children: ImmutablePropTypes.list
    })
};

Builder.defaultProps = {
    component: null
};
