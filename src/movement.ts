
const GRAVITY = 1600;
const FLOOR_Y = 430;
const SPEEDUP_TIME = 10;
const FRICTION = 10;
import { AreaComp, Comp, GameObj, KAPLAYCtx, PosComp } from "kaplay";

interface MovementComp extends Comp {
    velocity: { x: number, y: number },
    jump: (mult?: number) => void,
    jump_release: () => void,
    run_physics: (time: number) => void,
    dash_left: (mult?: number) => void,
    dash_right: (mult?: number) => void,
    move_left: (mult?: number) => void,
    move_right: (mult?: number) => void,
}

function movement_comp(k: KAPLAYCtx, { jump_vel, height, width, max_speed, terminal, gravity }: { jump_vel: number, height: number, width: number, max_speed: number, terminal?: number, gravity?: number }): MovementComp {
    let max_y = FLOOR_Y - height;
    let jump_y = FLOOR_Y - height * 1.25;
    let orig_max_speed = max_speed;
    let old_time = 0;
    let last_dash = 0;
    return {
        velocity: { x: 0, y: 0 },
        jump(this: GameObj<MovementComp | AreaComp | PosComp>, mult: number = 1) {
            if (this.pos.y >= jump_y) {
                this.velocity.y = -jump_vel * mult;
            }
        },
        jump_release(this: GameObj<MovementComp | AreaComp | PosComp>) {
            console.log(this.velocity.y);
            if (this.velocity.y < -(terminal ?? 0)) {
                this.velocity.y = -(terminal ?? 0);
            }
        },
        dash_left(this: GameObj<MovementComp | AreaComp | PosComp>, mult: number = 1) {
            if (last_dash > k.time() - 1) {
                return;
            }
            last_dash = k.time();
            this.velocity.x = -800 * mult;
            max_speed = 800 * mult;
            setTimeout(() => max_speed = orig_max_speed, 250);
        },
        dash_right(this: GameObj<MovementComp | AreaComp | PosComp>, mult: number = 1) {
            if (last_dash > k.time() - 1) {
                return;
            }
            last_dash = k.time();
            this.velocity.x = 800 * mult;
            max_speed = 800 * mult;
            setTimeout(() => max_speed = orig_max_speed, 250);
        },
        move_left(this: GameObj<MovementComp | AreaComp | PosComp>, mult: number = 1) {
            if (this.pos.y >= jump_y) {
                this.velocity.x -= max_speed * mult / SPEEDUP_TIME;
                this.velocity.x = Math.max(-max_speed * mult, this.velocity.x);
            }
            else {
                this.velocity.x -= max_speed * mult / SPEEDUP_TIME / 4;
                this.velocity.x = Math.max(-max_speed * mult, this.velocity.x);
            }

        },
        move_right(this: GameObj<MovementComp | PosComp>, mult: number = 1) {
            if (this.pos.y >= jump_y) {
                this.velocity.x += max_speed / SPEEDUP_TIME * mult;
                this.velocity.x = Math.min(max_speed * mult, this.velocity.x);
            }
            else {
                this.velocity.x += max_speed * mult / SPEEDUP_TIME / 4;
                this.velocity.x = Math.min(max_speed * mult, this.velocity.x);
            }
        },
        run_physics(this: GameObj<MovementComp | AreaComp | PosComp>, time: number) {
            if (old_time == 0) {
                old_time = time;
            }
            let dt = time - old_time;
            this.pos.x = Math.max(0, Math.min(960 - width, this.pos.x + this.velocity.x * dt));
            this.pos.y = this.pos.y + this.velocity.y * dt;
            if (this.pos.x == 0 || this.pos.x == 960 - width) this.velocity.x = 0;
            if (this.pos.y >= max_y) {
                if (this.velocity.x > 0) {
                    this.velocity.x = Math.max(0, this.velocity.x - FRICTION);
                }
                if (this.velocity.x < 0) {
                    this.velocity.x = Math.min(0, this.velocity.x + FRICTION);
                }
                this.pos.y = max_y;
                this.velocity.y = 0;
            }
            else {
                this.velocity.y += (gravity ?? GRAVITY) * dt;
            }
            old_time = time;
        },

    }

}

export { GRAVITY, FLOOR_Y, movement_comp };
export type { MovementComp };