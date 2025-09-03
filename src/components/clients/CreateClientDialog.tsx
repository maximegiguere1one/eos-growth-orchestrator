import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateClient } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";

const createClientSchema = z.object({
  name: z.string().min(1, "Le nom du client est obligatoire"),
  monthly_quota: z.number().min(1, "Le quota doit être d'au moins 1 vidéo"),
  is_active: z.boolean(),
});

type CreateClientForm = z.infer<typeof createClientSchema>;

interface CreateClientDialogProps {
  children: React.ReactNode;
}

export function CreateClientDialog({ children }: CreateClientDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createClient = useCreateClient();

  const form = useForm<CreateClientForm>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: "",
      monthly_quota: 12,
      is_active: true,
    },
  });

  const onSubmit = async (data: CreateClientForm) => {
    try {
      await createClient.mutateAsync({
        name: data.name,
        monthly_quota: data.monthly_quota,
        is_active: data.is_active,
      });
      toast({
        title: "Client créé",
        description: `Le client "${data.name}" a été ajouté avec succès.`,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le client. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau Client</DialogTitle>
          <DialogDescription>
            Créez un nouveau client avec son quota mensuel de vidéos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du client</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'entreprise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthly_quota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quota mensuel (vidéos)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Client actif</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Le client peut recevoir de nouvelles vidéos
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={createClient.isPending}>
                {createClient.isPending ? "Création..." : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}