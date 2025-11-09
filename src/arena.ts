import { GameObj, KAPLAYCtx } from "kaplay";
import { HealthComp, summon_baseball, summon_churro, summon_hotdog, summon_popcorn, summon_soda } from "./enemies";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function run_arena(k: KAPLAYCtx, index: number) {
    let original_play_id = (k.get("scene")[0] as any).play_id;
    let num_enemies = 6 + index * 2 + Math.floor(Math.random() * 5);
    let duration = 20 + index * 2;
    let enemy_list: GameObj<HealthComp>[] = [];
    let dist = [
        [0.5, 0.7, 0.9, 1],
        [0.4, 0.6, 0.8, 1],
        [0.2, 0.4, 0.6, 1],
    ][index > 10 ? 2 : (index > 3 ? 1 : 0)];
    let wave_count = 3 + Math.floor(index * 0.5);
    let wave_time = Math.floor(num_enemies * (0.2 + 0.8 * Math.random()));
    num_enemies += wave_count;
    let baseball_index = Math.floor(Math.random() * num_enemies);
    for (let i = 0; i < num_enemies; i++) {
        let enemy_type = Math.random();
        if (i < wave_time || i >= wave_time + wave_count) {
            await sleep((duration / num_enemies - 0.25 + Math.random() * 0.5) * 1000);
        }
        else {
            if (i == wave_time) {
                let text = k.add([
                    k.text("Wave incoming!", { align: "center", font: "monospace", width: 300 }),
                    k.pos(960 / 2 - 150, 540 / 2 - 150)
                ]);
                k.wait(1.5, () => text.destroy());
            }
            await sleep(250);
        }
        if (i == 0) {
            k.get("player")[0].combo_timer = 100;
            k.get("player")[0].combo_timer_enabled = true;
        }
        if (k.get("scene")[0].length == 0 || (k.get("scene")[0] as any).play_id != original_play_id) {
            return;
        }
        if (i == baseball_index) {
            summon_baseball(k);
        }
        else if (dist[0] > enemy_type) {
            enemy_list.push(summon_hotdog(k, 20 + index * 2));
        }
        else if (dist[1] > enemy_type) {
            enemy_list.push(summon_churro(k, 30 + index * 2));
        }
        else if (dist[2] > enemy_type) {
            enemy_list.push(summon_popcorn(k, 20 + index * 2));
        }
        else if (dist[3] > enemy_type) {
            enemy_list.push(summon_soda(k, 30 + index * 2));
        }
    }
    let controller = k.loop(0.2, () => {
        for (let i = 0; i < enemy_list.length; i++) {
            if (enemy_list[i].health > 0) return;
        }
        (k.get("scene")[0] as any).win_arena();
        controller.cancel();
    });

}

export { run_arena, sleep };