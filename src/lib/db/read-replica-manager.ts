/**
 * Read Replica Manager for database load balancing
 * Manages read operations across multiple database replicas
 */

export interface ReadReplicaConfig {
  url: string;
  weight: number;
  region?: string;
  isHealthy: boolean;
}

export class ReadReplicaManager {
  private replicas: ReadReplicaConfig[] = [];
  private currentIndex = 0;
  
  constructor(replicas: ReadReplicaConfig[] = []) {
    this.replicas = replicas;
  }
  
  addReplica(config: ReadReplicaConfig): void {
    this.replicas.push(config);
  }
  
  removeReplica(url: string): void {
    this.replicas = this.replicas.filter(replica => replica.url !== url);
  }
  
  getNextReplica(): ReadReplicaConfig | null {
    const healthyReplicas = this.replicas.filter(replica => replica.isHealthy);
    
    if (healthyReplicas.length === 0) {
      return null;
    }
    
    // Simple round-robin selection
    const replica = healthyReplicas[this.currentIndex % healthyReplicas.length];
    this.currentIndex++;
    
    return replica;
  }
  
  async checkHealth(): Promise<void> {
    // In production, this would ping each replica to check health
    for (const replica of this.replicas) {
      try {
        // Simulate health check
        replica.isHealthy = true;
      } catch (error) {
        replica.isHealthy = false;
      }
    }
  }
  
  getStats() {
    return {
      total: this.replicas.length,
      healthy: this.replicas.filter(r => r.isHealthy).length,
      replicas: this.replicas.map(r => ({
        url: r.url,
        weight: r.weight,
        region: r.region,
        isHealthy: r.isHealthy
      }))
    };
  }
}

export const readReplicaManager = new ReadReplicaManager();
export default readReplicaManager;