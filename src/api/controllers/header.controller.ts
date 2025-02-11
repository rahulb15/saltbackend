// controllers/header.controller.ts
import { Request, Response } from 'express';
import Hotel from '../../models/hotel.model';
import EventCategory from '../../models/eventCategory.model';
import { ResponseStatus, ResponseMessage, ResponseCode,ResponseDescription } from "../../enum/response-message.enum";

export class HeaderController {
  private static instance: HeaderController;

  public static getInstance(): HeaderController {
    if (!HeaderController.instance) {
      HeaderController.instance = new HeaderController();
    }
    return HeaderController.instance;
  }

  public async getHeaderData(req: Request, res: Response): Promise<any> {
    try {
      // Get hotels grouped by city
      const hotels = await Hotel.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$address.city',
            hotels: {
              $push: {
                title: '$name',
                link: `/hotels/${
                  '$address.city'.toLowerCase()
                }/${
                  '$name'.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
                }`,
                prviewIMg: { $arrayElemAt: ['$images', 0] }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            title: '$_id',
            link: {
              $concat: ['/hotels/', { $toLower: '$_id' }]
            },
            prviewIMg: { $arrayElemAt: ['$hotels.prviewIMg', 0] },
            megaMenu: '$hotels'
          }
        }
      ]);

      // Get event categories with their event types
      const eventCategories = await EventCategory.find(
        { isActive: true },
      ).lean();

      // Transform event categories to match menu structure
      const events = eventCategories.map(category => ({
        title: category.name,
        link: `/events/${category.slug}`,
        megaMenu: category.eventTypes.map(eventType => ({
          title: eventType.name,
          link: `/events/${category.slug}/${eventType.slug}`,
          prviewIMg: eventType.images[0] || null
        }))
      }));

      // Construct the full header menu data
      const menuData = {
        menu: [
          {
            id: 4,
            hasDropdown: true,
            children: true,
            active: true,
            title: "Events",
            link: "/events",
            submenus: events
          },
          {
            id: 5,
            hasDropdown: true,
            children: true,
            active: true,
            title: "Hotels",
            link: "/hotels",
            submenus: hotels
          },
          {
            id: 1,
            hasDropdown: false,
            children: false,
            active: true,
            title: "About Us",
            link: "/about"
          },
          {
            id: 2,
            hasDropdown: false,
            children: false,
            active: true,
            title: "Blog",
            link: "/blog"
          },
          {
            id: 3,
            hasDropdown: false,
            children: false,
            active: true,
            title: "Contact",
            link: "/contact"
          }
        ],
        stats: {
          totalHotels: await Hotel.countDocuments({ status: 'active' }),
          totalCities: hotels.length,
          totalEventCategories: eventCategories.length
        }
      };

      return res.status(ResponseCode.SUCCESS).json({
        status: ResponseStatus.SUCCESS,
        message: ResponseMessage.SUCCESS,
        description: ResponseDescription.SUCCESS,
        data: menuData
      });
    } catch (error) {
      console.error('Error in getHeaderData:', error);
      return res.status(ResponseCode.INTERNAL_SERVER_ERROR).json({
        status: ResponseStatus.INTERNAL_SERVER_ERROR,
        message: ResponseMessage.FAILED,
        description: ResponseDescription.INTERNAL_SERVER_ERROR,
        data: null
      });
    }
  }
}

export default HeaderController.getInstance();