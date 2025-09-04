import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../common/services/audit-log.service';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async get() {
    const contact = await this.prisma.contact.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!contact) {
      // Return default contact info if none exists
      return {
        id: null,
        phone: null,
        email: null,
        address: null,
        addressEn: null,
        businessHours: null,
        businessHoursEn: null,
        facebookUrl: null,
        zaloUrl: null,
        instagramUrl: null,
        appointmentLink: null,
        status: 'ACTIVE',
        createdAt: null,
        updatedAt: null,
      };
    }

    return contact;
  }

  async update(dto: {
    phone?: string;
    email?: string;
    address?: string;
    addressEn?: string;
    businessHours?: string;
    businessHoursEn?: string;
    facebookUrl?: string;
    zaloUrl?: string;
    instagramUrl?: string;
    appointmentLink?: string;
  }, userId: string) {
    // Check if contact record exists
    const existing = await this.prisma.contact.findFirst({
      where: { status: 'ACTIVE' },
    });

    let contact;
    if (existing) {
      // Update existing contact
      contact = await this.prisma.contact.update({
        where: { id: existing.id },
        data: {
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          addressEn: dto.addressEn,
          businessHours: dto.businessHours,
          businessHoursEn: dto.businessHoursEn,
          facebookUrl: dto.facebookUrl,
          zaloUrl: dto.zaloUrl,
          instagramUrl: dto.instagramUrl,
          appointmentLink: dto.appointmentLink,
        },
      });

      // Log the update with changes
      const changes: Record<string, any> = {};
      if (dto.phone !== existing.phone) {
        changes.phone = { from: existing.phone, to: dto.phone };
      }
      if (dto.email !== existing.email) {
        changes.email = { from: existing.email, to: dto.email };
      }
      if (dto.address !== existing.address) {
        changes.address = { from: existing.address, to: dto.address };
      }
      if (dto.addressEn !== existing.addressEn) {
        changes.addressEn = { from: existing.addressEn, to: dto.addressEn };
      }
      if (dto.businessHours !== existing.businessHours) {
        changes.businessHours = { from: existing.businessHours, to: dto.businessHours };
      }
      if (dto.businessHoursEn !== existing.businessHoursEn) {
        changes.businessHoursEn = { from: existing.businessHoursEn, to: dto.businessHoursEn };
      }
      if (dto.facebookUrl !== existing.facebookUrl) {
        changes.facebookUrl = { from: existing.facebookUrl, to: dto.facebookUrl };
      }
      if (dto.zaloUrl !== existing.zaloUrl) {
        changes.zaloUrl = { from: existing.zaloUrl, to: dto.zaloUrl };
      }
      if (dto.instagramUrl !== existing.instagramUrl) {
        changes.instagramUrl = { from: existing.instagramUrl, to: dto.instagramUrl };
      }
      if (dto.appointmentLink !== existing.appointmentLink) {
        changes.appointmentLink = { from: existing.appointmentLink, to: dto.appointmentLink };
      }

      await this.auditLog.logCRUD({
        operation: 'UPDATE',
        entity: 'CONTACT',
        entityId: contact.id,
        userId,
        entityName: 'Contact Information',
        changes: Object.keys(changes).length > 0 ? changes : undefined,
      });
    } else {
      // Create new contact record
      contact = await this.prisma.contact.create({
        data: {
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          addressEn: dto.addressEn,
          businessHours: dto.businessHours,
          businessHoursEn: dto.businessHoursEn,
          facebookUrl: dto.facebookUrl,
          zaloUrl: dto.zaloUrl,
          instagramUrl: dto.instagramUrl,
          appointmentLink: dto.appointmentLink,
          status: 'ACTIVE',
        },
      });

      // Log the creation
      await this.auditLog.logCRUD({
        operation: 'CREATE',
        entity: 'CONTACT',
        entityId: contact.id,
        userId,
        entityName: 'Contact Information',
        changes: {
          phone: contact.phone,
          email: contact.email,
          address: contact.address,
          addressEn: contact.addressEn,
          businessHours: contact.businessHours,
          businessHoursEn: contact.businessHoursEn,
          facebookUrl: contact.facebookUrl,
          zaloUrl: contact.zaloUrl,
          instagramUrl: contact.instagramUrl,
          appointmentLink: contact.appointmentLink,
        },
      });
    }

    return contact;
  }

  async getPublic() {
    const contact = await this.prisma.contact.findFirst({
      where: { status: 'ACTIVE' },
      select: {
        phone: true,
        email: true,
        address: true,
        addressEn: true,
        businessHours: true,
        businessHoursEn: true,
        facebookUrl: true,
        zaloUrl: true,
        instagramUrl: true,
        appointmentLink: true,
      },
    });

    if (!contact) {
      // Return default contact info if none exists
      return {
        phone: null,
        email: null,
        address: null,
        addressEn: null,
        businessHours: null,
        businessHoursEn: null,
        facebookUrl: null,
        zaloUrl: null,
        instagramUrl: null,
        appointmentLink: null,
      };
    }

    return contact;
  }

  async getHistory() {
    const contacts = await this.prisma.contact.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return {
      contacts,
      count: contacts.length,
    };
  }

  async getStats() {
    const totalContacts = await this.prisma.contact.count();
    const activeContacts = await this.prisma.contact.count({
      where: { status: 'ACTIVE' },
    });
    const inactiveContacts = await this.prisma.contact.count({
      where: { status: 'INACTIVE' },
    });

    const recentUpdates = await this.prisma.contact.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return {
      totalContacts,
      activeContacts,
      inactiveContacts,
      recentUpdates,
    };
  }
}
