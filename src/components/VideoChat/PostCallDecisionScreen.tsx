import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Heart } from "lucide-react";

interface PostCallDecisionScreenProps {
  profile: { username: string; photo?: string };
  onReject: () => void;
  onAccept: () => void;
}

export function PostCallDecisionScreen({ profile, onReject, onAccept }: PostCallDecisionScreenProps) {
  return (
    <main className="min-h-screen bg-background pb-24 px-4 pt-16 safe-area-top safe-area-bottom">
      <section className="max-w-lg mx-auto text-center">
        <h2 className="text-2xl font-bold font-poppins mb-8 text-foreground">Make a Connection?</h2>

        <Card className="shadow-card rounded-2xl overflow-hidden mb-8 border-0">
          <CardContent className="p-6">
            <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden mb-4">
              {profile.photo ? (
                <img src={profile.photo} alt={`${profile.username} profile photo`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                  <Heart className="w-16 h-16 text-white" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-semibold font-poppins text-foreground">{profile.username}</h3>
            <p className="text-muted-foreground font-poppins">Liked chatting with you</p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-16 h-16 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground border-2 shadow-card"
            onClick={onReject}
            aria-label="Reject friendship"
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            variant="default"
            size="lg"
            className="rounded-full w-16 h-16 bg-gradient-primary border-0 text-white shadow-warm"
            onClick={onAccept}
            aria-label="Accept friendship"
          >
            <Heart className="w-6 h-6" />
          </Button>
        </div>
      </section>
    </main>
  );
}
