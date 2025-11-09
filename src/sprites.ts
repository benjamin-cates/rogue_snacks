import { KAPLAYCtx } from "kaplay";

function add_sprites(k: KAPLAYCtx) {
    k.loadSprite("player", "/sprites/player_sheet.png", {
        sliceX: 7,
        anims: {
            stand: { from: 0, to: 0 },
            walk_left: { from: 1, to: 3, loop: true, speed: 20 },
            walk_right: { from: 4, to: 6, loop: true, speed: 20 },
        },
    });
    k.loadSprite("hotdog", "/sprites/hotdog-Sheet.png", {
        sliceX: 5,
        anims: {
            stand: { from: 0, to: 0 },
            walk: { from: 1, to: 4, loop: true, speed: 5 },
        }
    });
    k.loadSprite("kernel", "/sprites/kernel.png");
    k.loadSprite("popcorn", "/sprites/popcorn-Sheet.png", {
        sliceX: 2,
        anims: {
            stand: { from: 0, to: 0 },
            pop: { from: 1, to: 1 },
        }
    });
    k.loadSprite("soda", "/sprites/solo_cup-Sheet.png", {
        sliceX: 6,
        anims: {
            stand: { from: 0, to: 0 },
            fizz: { from: 1, to: 5, loop: true, speed: 10 },
        }
    });
    k.loadSprite("button", "/sprites/button.png", { sliceY: 2 });
    k.loadSprite("churro", "/sprites/churro.png");
    k.loadSprite("soda_particle", "/sprites/soda_particle.png");
    k.loadSprite("bat", "/sprites/bat.png");
    k.loadSprite("card_heal_half_health", "/sprites/card_heal_half_health.png");
    k.loadSprite("card_faster_attack", "/sprites/card_faster_attack.png");
    k.loadSprite("card_inc_jump_height", "/sprites/card_inc_jump_height.png");
    k.loadSprite("card_inc_speed", "/sprites/card_inc_speed.png");
    k.loadSprite("card_more_attack_damage", "/sprites/card_more_attack_damage.png");
    k.loadSprite("card_longer_timer", "/sprites/card_longer_timer.png");
    k.loadSprite("card_longer_attack_distance", "/sprites/card_longer_attack_distance.png");
    k.loadSprite("background", "/sprites/background.png");
    k.loadSprite("stadium", "/sprites/stadium_sheet.png", {
        sliceY: 5, anims: {
            wave: { from: 0, to: 4, speed: 5 },
            no_wave: { from: 0, to: 0 },
        }
    });
    k.loadSprite("baseball", "/sprites/baseball.png");
    k.loadSprite("controls", "/sprites/controls.png");
    k.loadSprite("logo_text", "/sprites/logo_text.png");
}

function add_sounds(k: KAPLAYCtx) {
    k.loadSound("fizz", "/audio/fizz.ogg");
    k.loadSound("pop", "/audio/pop.ogg");
    k.loadSound("sting", "/audio/sting_reverb.ogg");
    k.loadSound("cheer1", "/audio/cheer1.ogg");
    k.loadSound("cheer2", "/audio/cheer2.ogg");
    k.loadSound("build", "/audio/build_reverb.ogg");
    k.loadSound("background", "/audio/background_reverb.ogg");
    k.loadSound("hurt", "/audio/hurt.wav");
    k.loadSound("baseball_hit", "/audio/baseball_hit.wav");
    k.loadSound("point", "/audio/point.ogg");
}

export { add_sprites, add_sounds }