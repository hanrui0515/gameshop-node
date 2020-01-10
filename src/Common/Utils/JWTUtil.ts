import JWT from 'jsonwebtoken';

export default class JWTUtil {
    private static privateKey = '@Fina1_Pr0j3ct@S0fT3S5@Privat3K3y!';
    private static issuer = 'JWTUtil_v1';

    public static sign(data: string | object | Buffer, expiredAt?: Date) {
        return JWT.sign(data, this.privateKey, {
            algorithm: 'HS256',
            expiresIn: expiredAt ? Math.round((expiredAt.getTime() - Date.now()) / 1000) : undefined,
            issuer: this.issuer,
        });
    }

    public static read(token: string): string | object {
        try {
            return JWT.verify(token, this.privateKey, {
                issuer: this.issuer,
            });
        } catch (e) {
            return null;
        }
    }

    public static verify(token: string): boolean {
        return this.read(token) !== null;
    }
}
