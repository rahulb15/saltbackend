
// interfaces/header.interface.ts
export interface IMenuItem {
    id: number;
    title: string;
    link: string;
    hasDropdown: boolean;
    children: boolean;
    active: boolean;
    submenus?: ISubmenuItem[];
  }
  
  export interface ISubmenuItem {
    title: string;
    link: string;
    prviewIMg?: string;
    megaMenu?: IMegaMenuItem[];
  }
  
  export interface IMegaMenuItem {
    title: string;
    link: string;
    prviewIMg: string;
  }
  
  export interface IHeaderStats {
    totalHotels: number;
    totalCities: number;
    totalEventCategories: number;
  }
  
  export interface IHeaderData {
    menu: IMenuItem[];
    stats: IHeaderStats;
  }