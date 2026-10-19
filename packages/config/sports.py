"""
HoloCoach AI — Sport Configurations
Ideal joint angles, scoring rules, and movement templates for all supported sports.
This is the Python mirror of the frontend sport configuration.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class IdealAngles:
    left_elbow: float = 160.0
    right_elbow: float = 160.0
    left_knee: float = 170.0
    right_knee: float = 170.0
    left_shoulder: float = 45.0
    right_shoulder: float = 45.0
    left_hip: float = 170.0
    right_hip: float = 170.0

    def to_dict(self) -> Dict[str, float]:
        return {
            "left_elbow": self.left_elbow, "right_elbow": self.right_elbow,
            "left_knee": self.left_knee, "right_knee": self.right_knee,
            "left_shoulder": self.left_shoulder, "right_shoulder": self.right_shoulder,
            "left_hip": self.left_hip, "right_hip": self.right_hip,
        }


@dataclass
class ScoringWeights:
    upper_body: float = 0.25
    core: float = 0.25
    lower_body: float = 0.25
    balance: float = 0.25


@dataclass
class Movement:
    name: str
    description: str
    key_joints: List[str]


@dataclass
class SportConfig:
    id: str
    name: str
    icon: str
    category: str
    ideal_angles: IdealAngles
    tolerances: Dict[str, float]
    scoring_weights: ScoringWeights
    movements: List[Movement]
    tips: List[str]


# =============================================================================
# All Sport Configurations
# =============================================================================

SPORTS: Dict[str, SportConfig] = {
    "football": SportConfig(
        id="football", name="Football", icon="⚽", category="Team",
        ideal_angles=IdealAngles(
            left_elbow=155, right_elbow=155, left_knee=130, right_knee=130,
            left_shoulder=40, right_shoulder=40, left_hip=160, right_hip=160,
        ),
        tolerances={"good": 12, "warning": 28},
        scoring_weights=ScoringWeights(upper_body=0.15, core=0.25, lower_body=0.4, balance=0.2),
        movements=[
            Movement("Kick", "Ball striking technique", ["right_knee", "right_hip", "left_knee"]),
            Movement("Sprint", "Running form analysis", ["left_knee", "right_knee", "left_hip", "right_hip"]),
            Movement("Header", "Heading technique", ["left_shoulder", "right_shoulder", "left_hip", "right_hip"]),
            Movement("Dribble", "Ball control posture", ["left_knee", "right_knee", "left_hip", "right_hip"]),
        ],
        tips=["Plant foot should point toward target when kicking",
              "Keep body leaning slightly forward during sprint",
              "Eyes on the ball during headers, use forehead contact"],
    ),

    "cricket": SportConfig(
        id="cricket", name="Cricket", icon="🏏", category="Team",
        ideal_angles=IdealAngles(
            left_elbow=165, right_elbow=165, left_knee=140, right_knee=140,
            left_shoulder=90, right_shoulder=90, left_hip=155, right_hip=155,
        ),
        tolerances={"good": 10, "warning": 22},
        scoring_weights=ScoringWeights(upper_body=0.35, core=0.25, lower_body=0.25, balance=0.15),
        movements=[
            Movement("Batting Stance", "Ready position analysis", ["left_knee", "right_knee", "left_shoulder", "right_shoulder"]),
            Movement("Bowling Action", "Bowling arm and body mechanics", ["right_shoulder", "right_elbow", "right_hip", "left_knee"]),
            Movement("Fielding", "Catch and throw posture", ["left_knee", "right_knee", "left_shoulder", "right_shoulder"]),
            Movement("Drive Shot", "Front foot drive technique", ["left_knee", "left_hip", "right_shoulder", "right_elbow"]),
        ],
        tips=["Keep elbow high during bowling action",
              "Maintain a side-on stance when batting",
              "Bend knees in fielding ready position"],
    ),

    "rugby": SportConfig(
        id="rugby", name="Rugby", icon="🏉", category="Team",
        ideal_angles=IdealAngles(
            left_elbow=90, right_elbow=90, left_knee=120, right_knee=120,
            left_shoulder=50, right_shoulder=50, left_hip=140, right_hip=140,
        ),
        tolerances={"good": 15, "warning": 30},
        scoring_weights=ScoringWeights(upper_body=0.25, core=0.3, lower_body=0.3, balance=0.15),
        movements=[
            Movement("Tackle", "Safe tackling technique", ["left_knee", "right_knee", "left_shoulder", "right_shoulder"]),
            Movement("Scrum", "Scrum body position", ["left_hip", "right_hip", "left_knee", "right_knee"]),
            Movement("Pass", "Lateral passing form", ["left_shoulder", "right_shoulder", "left_elbow", "right_elbow"]),
            Movement("Ruck", "Ruck body position", ["left_hip", "right_hip", "left_knee", "right_knee"]),
        ],
        tips=["Keep head to the side during tackle",
              "Flat back with hips below shoulders in scrum",
              "Follow through with arms when passing"],
    ),

    "badminton": SportConfig(
        id="badminton", name="Badminton", icon="🏸", category="Racquet",
        ideal_angles=IdealAngles(
            left_elbow=150, right_elbow=140, left_knee=135, right_knee=135,
            left_shoulder=60, right_shoulder=120, left_hip=165, right_hip=165,
        ),
        tolerances={"good": 10, "warning": 22},
        scoring_weights=ScoringWeights(upper_body=0.35, core=0.2, lower_body=0.25, balance=0.2),
        movements=[
            Movement("Smash", "Overhead smash technique", ["right_shoulder", "right_elbow", "right_hip", "right_knee"]),
            Movement("Drop Shot", "Deceptive drop shot form", ["right_shoulder", "right_elbow", "right_knee"]),
            Movement("Net Play", "Front court positioning", ["left_knee", "right_knee", "right_elbow"]),
            Movement("Footwork", "Court movement patterns", ["left_knee", "right_knee", "left_hip", "right_hip"]),
        ],
        tips=["Full arm extension at highest point for smash",
              "Stay on balls of feet for quick movement",
              "Racquet up in ready position between shots"],
    ),

    "tennis": SportConfig(
        id="tennis", name="Tennis", icon="🎾", category="Racquet",
        ideal_angles=IdealAngles(
            left_elbow=150, right_elbow=140, left_knee=140, right_knee=140,
            left_shoulder=55, right_shoulder=120, left_hip=165, right_hip=165,
        ),
        tolerances={"good": 10, "warning": 24},
        scoring_weights=ScoringWeights(upper_body=0.35, core=0.2, lower_body=0.25, balance=0.2),
        movements=[
            Movement("Serve", "Service motion analysis", ["right_shoulder", "right_elbow", "right_knee", "right_hip"]),
            Movement("Forehand", "Forehand stroke technique", ["right_shoulder", "right_elbow", "right_hip", "right_knee"]),
            Movement("Backhand", "Backhand stroke form", ["left_shoulder", "right_shoulder", "right_elbow", "right_knee"]),
            Movement("Volley", "Net volley positioning", ["right_elbow", "left_knee", "right_knee"]),
        ],
        tips=["Trophy position: racquet behind head, elbow at 90°",
              "Rotate hips before shoulders on groundstrokes",
              "Split step before every shot"],
    ),

    "basketball": SportConfig(
        id="basketball", name="Basketball", icon="🏀", category="Team",
        ideal_angles=IdealAngles(
            left_elbow=90, right_elbow=90, left_knee=130, right_knee=130,
            left_shoulder=80, right_shoulder=80, left_hip=155, right_hip=155,
        ),
        tolerances={"good": 10, "warning": 25},
        scoring_weights=ScoringWeights(upper_body=0.35, core=0.2, lower_body=0.25, balance=0.2),
        movements=[
            Movement("Shooting", "Jump shot form", ["right_elbow", "right_shoulder", "right_knee", "right_hip"]),
            Movement("Dribbling", "Ball handling posture", ["left_knee", "right_knee", "left_hip", "right_hip"]),
            Movement("Defense", "Defensive stance analysis", ["left_knee", "right_knee", "left_hip", "right_hip"]),
            Movement("Layup", "Layup approach technique", ["left_knee", "right_knee", "right_elbow", "right_shoulder"]),
        ],
        tips=["Shooting elbow should be at 90° (L-shape)",
              "Low athletic stance for defensive positioning",
              "Follow through: snap wrist, cookie jar finish"],
    ),

    "swimming": SportConfig(
        id="swimming", name="Swimming", icon="🏊", category="Individual",
        ideal_angles=IdealAngles(
            left_elbow=160, right_elbow=160, left_knee=170, right_knee=170,
            left_shoulder=170, right_shoulder=170, left_hip=175, right_hip=175,
        ),
        tolerances={"good": 8, "warning": 20},
        scoring_weights=ScoringWeights(upper_body=0.35, core=0.3, lower_body=0.2, balance=0.15),
        movements=[
            Movement("Freestyle Stroke", "Arm pull pattern", ["right_shoulder", "right_elbow", "left_shoulder", "left_elbow"]),
            Movement("Streamline", "Streamline body position", ["left_shoulder", "right_shoulder", "left_hip", "right_hip"]),
            Movement("Kick Drill", "Flutter kick technique", ["left_knee", "right_knee", "left_hip", "right_hip"]),
            Movement("Turn Prep", "Flip turn approach form", ["left_hip", "right_hip", "left_knee", "right_knee"]),
        ],
        tips=["High elbow catch — keep elbow above wrist",
              "Body rotation drives power, not just arms",
              "Kick from hips, not knees — minimal knee bend"],
    ),

    "athletics": SportConfig(
        id="athletics", name="Athletics", icon="🏃", category="Individual",
        ideal_angles=IdealAngles(
            left_elbow=90, right_elbow=90, left_knee=140, right_knee=140,
            left_shoulder=45, right_shoulder=45, left_hip=165, right_hip=165,
        ),
        tolerances={"good": 10, "warning": 22},
        scoring_weights=ScoringWeights(upper_body=0.2, core=0.25, lower_body=0.35, balance=0.2),
        movements=[
            Movement("Sprint Start", "Block start technique", ["left_knee", "right_knee", "left_hip", "right_hip"]),
            Movement("Sprint Form", "Mid-race running form", ["left_elbow", "right_elbow", "left_knee", "right_knee"]),
            Movement("Long Jump", "Takeoff and flight phase", ["left_knee", "right_knee", "left_hip", "right_hip"]),
            Movement("Shot Put", "Throwing technique", ["right_shoulder", "right_elbow", "right_hip", "right_knee"]),
        ],
        tips=["Drive arms at 90° angle during sprinting",
              "High knee lift for maximum stride length",
              "Push off from balls of feet, not heels"],
    ),

    "yoga": SportConfig(
        id="yoga", name="Yoga", icon="🧘", category="Fitness",
        ideal_angles=IdealAngles(
            left_elbow=170, right_elbow=170, left_knee=170, right_knee=170,
            left_shoulder=90, right_shoulder=90, left_hip=170, right_hip=170,
        ),
        tolerances={"good": 8, "warning": 18},
        scoring_weights=ScoringWeights(upper_body=0.25, core=0.25, lower_body=0.25, balance=0.25),
        movements=[
            Movement("Warrior I", "Virabhadrasana I alignment", ["left_knee", "right_knee", "left_shoulder", "right_shoulder"]),
            Movement("Warrior II", "Virabhadrasana II alignment", ["left_knee", "left_hip", "left_shoulder", "right_shoulder"]),
            Movement("Tree Pose", "Vrksasana balance", ["left_knee", "right_knee", "left_hip", "right_hip"]),
            Movement("Downward Dog", "Adho Mukha Svanasana form", ["left_shoulder", "right_shoulder", "left_hip", "right_hip"]),
        ],
        tips=["Keep shoulders away from ears in all poses",
              "Engage core — belly button toward spine",
              "Focus gaze (drishti) for balance poses"],
    ),

    "boxing": SportConfig(
        id="boxing", name="Boxing", icon="🥊", category="Combat",
        ideal_angles=IdealAngles(
            left_elbow=90, right_elbow=90, left_knee=140, right_knee=140,
            left_shoulder=35, right_shoulder=35, left_hip=155, right_hip=155,
        ),
        tolerances={"good": 10, "warning": 25},
        scoring_weights=ScoringWeights(upper_body=0.35, core=0.25, lower_body=0.2, balance=0.2),
        movements=[
            Movement("Jab", "Lead hand straight punch", ["left_shoulder", "left_elbow", "left_hip", "left_knee"]),
            Movement("Cross", "Rear hand power punch", ["right_shoulder", "right_elbow", "right_hip", "right_knee"]),
            Movement("Hook", "Lead hook technique", ["left_shoulder", "left_elbow", "left_hip"]),
            Movement("Defense", "Guard and slip technique", ["left_elbow", "right_elbow", "left_knee", "right_knee"]),
        ],
        tips=["Chin down, hands up — protect your centerline",
              "Rotate hips for power, not just arms",
              "Return to guard position after every punch"],
    ),
}


def get_sport(sport_id: str) -> Optional[SportConfig]:
    return SPORTS.get(sport_id)


def get_all_sports() -> List[SportConfig]:
    return list(SPORTS.values())


def get_ideal_angle(sport_id: str, joint: str) -> float:
    sport = SPORTS.get(sport_id)
    if not sport:
        return 160.0
    return sport.ideal_angles.to_dict().get(joint, 160.0)
