import { supabase } from '../../lib/supabase';
import { EmailLog, CreateEmailLogParams, EmailLogUpdate, EmailLogFilter } from './types/emailLog';
import { Database } from '../../types/supabase';

type EmailLogRow = Database['public']['Tables']['email_logs']['Row'];
type EmailLogInsert = Database['public']['Tables']['email_logs']['Insert'];

export class EmailLogger {
  async createLog(params: CreateEmailLogParams): Promise<EmailLog> {
    console.log('Creating email log:', params);
    
    try {
      const logData: EmailLogInsert = {
        recipient: params.recipient,
        subject: params.subject,
        template_name: params.template_name,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('email_logs')
        .insert([logData])
        .select()
        .single();

      if (error) {
        console.error('Failed to create email log:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from email log creation');
      }

      console.log('Email log created:', data);
      return this.transformEmailLog(data);
    } catch (error) {
      console.error('Error in createLog:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: EmailLog['status'], error?: string): Promise<void> {
    console.log('Updating email log:', { id, status, error });
    
    try {
      const updateData: EmailLogUpdate = {
        status,
        error: error || null,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('email_logs')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        console.error('Failed to update email log:', updateError);
        throw updateError;
      }

      console.log('Email log updated successfully');
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }

  async getLogs(filter?: EmailLogFilter): Promise<EmailLog[]> {
    try {
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter?.recipient) {
        query = query.eq('recipient', filter.recipient);
      }

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate);
      }

      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch email logs:', error);
        throw error;
      }

      return (data || []).map((row: EmailLogRow) => this.transformEmailLog(row));
    } catch (error) {
      console.error('Error in getLogs:', error);
      throw error;
    }
  }

  private transformEmailLog(row: EmailLogRow): EmailLog {
    return {
      id: row.id,
      recipient: row.recipient,
      subject: row.subject,
      template_name: row.template_name,
      status: row.status,
      error: row.error,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}

export const emailLogger = new EmailLogger();