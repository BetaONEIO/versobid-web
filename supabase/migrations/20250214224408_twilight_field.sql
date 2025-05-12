-- Create function to handle welcome email with Resend integration\nCREATE OR REPLACE FUNCTION send_welcome_email()\nRETURNS TRIGGER AS $$\nBEGIN\n  -- Insert welcome email into email_logs\n  INSERT INTO email_logs (\n    recipient,\n    subject,\n    template_name,\n    status,\n    data\n  ) VALUES (\n    NEW.email,\n    'Welcome to VersoBid!',\n    'welcome',\n    'pending',\n    jsonb_build_object(\n      'name', COALESCE(NEW.full_name, NEW.username),\n      'dashboard_link', current_setting('app.frontend_url', true) || '/dashboard'\n    )\n  );
\n\n  -- Create welcome notification\n  INSERT INTO notifications (\n    user_id,\n    type,\n    message,\n    data\n  ) VALUES (\n    NEW.id,\n    'welcome',\n    'Welcome to VersoBid! Complete your profile to get started.',\n    jsonb_build_object(\n      'profile_link', '/profile/' || NEW.username\n    )\n  );
\n\n  RETURN NEW;
\nEND;
\n$$ LANGUAGE plpgsql SECURITY DEFINER;
\n\n-- Recreate trigger\nDROP TRIGGER IF EXISTS send_welcome_email_trigger ON profiles;
\nCREATE TRIGGER send_welcome_email_trigger\n  AFTER INSERT ON profiles\n  FOR EACH ROW\n  EXECUTE FUNCTION send_welcome_email();
;
