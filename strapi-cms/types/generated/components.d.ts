import type { Schema, Attribute } from '@strapi/strapi';

export interface AboutCurrentPosition extends Schema.Component {
  collectionName: 'components_ui_current_positions';
  info: {
    displayName: 'currentPosition';
    description: '';
  };
  attributes: {
    companyTitle: Attribute.String;
    positionTitle: Attribute.String;
    since: Attribute.Date;
    companyLink: Attribute.String;
  };
}

export interface AboutSkills extends Schema.Component {
  collectionName: 'components_about_skills';
  info: {
    displayName: 'skills';
    description: '';
  };
  attributes: {
    name: Attribute.String;
    description: Attribute.RichText;
    icon: Attribute.String &
      Attribute.CustomField<'plugin::fontawesome-strapi.icon'>;
  };
}

export interface AboutTech extends Schema.Component {
  collectionName: 'components_about_teches';
  info: {
    displayName: 'tech';
    description: '';
  };
  attributes: {
    name: Attribute.String;
    link: Attribute.String;
    icon: Attribute.String &
      Attribute.CustomField<'plugin::fontawesome-strapi.icon'>;
  };
}

export interface SeoDefaultSeo extends Schema.Component {
  collectionName: 'components_seo_default_seos';
  info: {
    displayName: 'defaultSeo';
  };
  attributes: {
    MetaTitle: Attribute.String;
    MetaDescription: Attribute.Text;
    shareImage: Attribute.Media;
  };
}

export interface UiHero extends Schema.Component {
  collectionName: 'components_ui_heroes';
  info: {
    displayName: 'hero';
  };
  attributes: {
    title: Attribute.String;
    cover: Attribute.Media;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'about.current-position': AboutCurrentPosition;
      'about.skills': AboutSkills;
      'about.tech': AboutTech;
      'seo.default-seo': SeoDefaultSeo;
      'ui.hero': UiHero;
    }
  }
}
