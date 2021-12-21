

export class IDPool {

    liveIdCount:number = 0
    currentMaxId:number = 0
    idleIds:number[] = []

    currentIds:any = {} 

    reset() {
        this.idleIds = []
        this.liveIdCount = 0
        this.currentMaxId = 0
        this.currentIds = {}
    }

    addToIdle(id:number) {
        this.idleIds.push(id)
    }

    setIdle(id:number) {
        if (this.currentIds[id]) {
            
            this.addToIdle(id)
            this.liveIdCount--
            this.currentIds[id] = false
        } else
            console.error('id', id, "is not active, so can't be set to idle")
    }

    newId():number {

        if (this.idleIds.length > 0) {
            this.liveIdCount++

            // save, since this.idleIds.length > 0
            let id:number | undefined = this.idleIds.shift()
            
            if (id != undefined) this.currentIds[id] = true
            else id = 0 // dead code to make TS happy

            return id
        } else {
            this.currentMaxId++
            this.liveIdCount++
            let id = this.liveIdCount - 1
            
            this.currentIds[id] = true
            
            return id
        }

    }
}