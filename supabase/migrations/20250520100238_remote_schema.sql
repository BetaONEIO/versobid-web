CREATE TRIGGER after_user_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION send_verification_email();
ALTER TABLE "auth"."users" DISABLE TRIGGER "after_user_signup";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION create_new_profile();

CREATE TRIGGER send_verification_email_trigger AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION send_verification_email();
ALTER TABLE "auth"."users" DISABLE TRIGGER "send_verification_email_trigger";

CREATE TRIGGER send_welcome_email_trigger AFTER UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW WHEN (((old.email_confirmed_at IS NULL) AND (new.email_confirmed_at IS NOT NULL))) EXECUTE FUNCTION send_welcome_email();
ALTER TABLE "auth"."users" DISABLE TRIGGER "send_welcome_email_trigger";


create policy "Public can view avatars"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'avatars'::text));


create policy "Public can view wanted item images"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'wanted-items'::text));


create policy "Users can delete their own wanted item images"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'wanted-items'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


create policy "Users can update their own avatar"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


create policy "Users can update their own wanted item images"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'wanted-items'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


create policy "Users can upload their own avatar"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


create policy "Users can upload wanted item images"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'wanted-items'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



