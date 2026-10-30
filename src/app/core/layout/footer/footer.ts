import { Component } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';

export interface FooterNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly routerLink?: string;
  readonly fragment?: string;
}

export interface FooterSocialNetwork {
  readonly id: 'facebook' | 'instagram' | 'tiktok' | 'youtube';
  readonly label: string;
  readonly href?: string;
}

export const FOOTER_EXPLORE_LINKS: readonly FooterNavigationItem[] = [
  { id: 'home', label: 'Inicio', routerLink: '/' },
  { id: 'categories', label: 'Categorías', routerLink: '/', fragment: 'categories' },
  { id: 'offers', label: 'Oferta', routerLink: '/', fragment: 'limited-offers' },
  { id: 'news', label: 'Noticias', routerLink: '/', fragment: 'news' },
];

export const FOOTER_COMPANY_LINKS: readonly FooterNavigationItem[] = [
  { id: 'about', label: 'Acerca de nosotros' },
  { id: 'sell', label: 'Vende en Axteri' },
];

export const FOOTER_HELP_LINKS: readonly FooterNavigationItem[] = [
  { id: 'customer-service', label: 'Atención al cliente' },
  { id: 'help-center', label: 'Centro de ayuda' },
  { id: 'claims-book', label: 'Libro de reclamaciones' },
];

export const FOOTER_SOCIAL_NETWORKS: readonly FooterSocialNetwork[] = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
];

@Component({
  selector: 'app-footer',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly exploreLinks = FOOTER_EXPLORE_LINKS;
  protected readonly companyLinks = FOOTER_COMPANY_LINKS;
  protected readonly helpLinks = FOOTER_HELP_LINKS;
  protected readonly socialNetworks = FOOTER_SOCIAL_NETWORKS;
  protected readonly currentYear = new Date().getFullYear();
  protected readonly activeMatchOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'exact',
    matrixParams: 'ignored',
  };
}
