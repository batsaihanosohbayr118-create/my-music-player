// Backgrounds the user can pick as the app background.
const BACKGROUNDS = [
  { id: 'pin-1', url: 'https://i.pinimg.com/736x/45/17/69/4517693815fefca47294952382763391.jpg' },
  { id: 'pin-2', url: 'https://i.pinimg.com/1200x/e4/22/ff/e422ffe362303ce926bb7192395adf2f.jpg' },
  { id: 'pin-3', url: 'https://i.pinimg.com/736x/7e/78/a0/7e78a067276c362dd080bd6cc3d31632.jpg' },
  { id: 'pin-4', url: 'https://i.pinimg.com/1200x/7e/65/0a/7e650a9674f74648e46ee7cf1b361af4.jpg' },
  { id: 'pin-5', url: 'https://i.pinimg.com/736x/14/10/91/1410918417c138135ebecbdf96b9d0ad.jpg' },
  { id: 'pin-6', url: 'https://i.pinimg.com/736x/0a/86/bd/0a86bd7e3647072741da12b8cd1684a8.jpg' },
  { id: 'pin-7', url: 'https://i.pinimg.com/1200x/7e/9f/0d/7e9f0d50faf0178672abddfecfbbc865.jpg' },
  { id: 'pin-8', url: 'https://i.pinimg.com/1200x/a8/34/98/a83498947c6e22c1ae6b395126dfd5ab.jpg' },
  { id: 'pin-9', url: 'https://i.pinimg.com/736x/c4/50/51/c45051508403eb413a0ccfec2f7aecdc.jpg' },
  { id: 'pin-10', url: 'https://i.pinimg.com/1200x/0e/b1/56/0eb156259d12680f1fbccacb60c06bf2.jpg' },
  { id: 'pin-11', url: 'https://i.pinimg.com/736x/5e/ac/28/5eac280bf5640797d2892ad0da707154.jpg' },
  { id: 'pin-12', url: 'https://i.pinimg.com/736x/97/cf/12/97cf127d86154c5a3fd6944368f2706b.jpg' },
  { id: 'pin-13', url: 'https://i.pinimg.com/736x/4b/8a/38/4b8a3849db18712176b75ce214ec6d19.jpg' },
  { id: 'pin-14', url: 'https://i.pinimg.com/736x/56/e8/7b/56e87b301634f9051eb2b7aaf3c09d38.jpg' },
  { id: 'pin-15', url: 'https://i.pinimg.com/736x/00/e2/93/00e293b6ca5b863ab6ef55d3b99b9ee2.jpg' },
  { id: 'pin-16', url: 'https://i.pinimg.com/736x/04/85/a4/0485a47408ff7fe8f4bf71078b639d92.jpg' },
  { id: 'pin-17', url: 'https://i.pinimg.com/736x/ca/8c/b4/ca8cb4eef3654db6d93686cbcd865248.jpg' },
  { id: 'pin-18', url: 'https://i.pinimg.com/736x/4d/b8/45/4db845be92a5cfc18d787d246274772c.jpg' },
  { id: 'pin-19', url: 'https://i.pinimg.com/736x/42/8a/de/428ade149f4524a5592c18cab435a018.jpg' },
  { id: 'pin-20', url: 'https://i.pinimg.com/736x/11/31/0a/11310a22b53da163411a6472d628c9eb.jpg' },
  { id: 'pin-21', url: 'https://i.pinimg.com/1200x/b9/55/18/b955185d1ce333398153ce8ce89f4f6f.jpg' },
  { id: 'pin-22', url: 'https://i.pinimg.com/736x/28/86/e7/2886e74036161203a163c4566d305817.jpg' },
  { id: 'pin-23', url: 'https://i.pinimg.com/1200x/7d/2a/5a/7d2a5a0667801531cb67070927b662f5.jpg' },
  { id: 'pin-24', url: 'https://i.pinimg.com/736x/7e/93/de/7e93deefac73f6a1a45d57e48cb54a1f.jpg' },
  { id: 'pin-25', url: 'https://i.pinimg.com/1200x/41/7c/4c/417c4cf8a4365ea409abac5763c6d7ab.jpg' },
  { id: 'pin-26', url: 'https://i.pinimg.com/originals/bd/4f/d1/bd4fd1c2d9d3b0c9e40d3f1bb00d8072.gif' },
  { id: 'pin-27', url: 'https://i.pinimg.com/736x/8d/b3/80/8db3805952ddd18b85c8cd78d6585d1d.jpg' },
  { id: 'pin-28', url: 'https://i.pinimg.com/736x/2c/03/c5/2c03c5bb3da591153445495a6142a56d.jpg' },
  { id: 'pin-29', url: 'https://i.pinimg.com/736x/41/46/7a/41467a77d3b9ea7c0836c80d655deed6.jpg' },
  { id: 'pin-30', url: 'https://i.pinimg.com/736x/21/e2/bc/21e2bca9e9f7838b0b53276b16510ba0.jpg' },
  { id: 'pin-31', url: 'https://i.pinimg.com/1200x/53/c4/96/53c4963e8e9c60b9652055b8382d7db4.jpg' },
]

type Props = {
  selected: string | null
  onSelect: (url: string | null) => void
}

export default function FavoritesView({ selected, onSelect }: Props) {
  return (
    <section className="favorites-view">
      <div className="background-grid">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            className={selected === bg.url ? 'background-tile active' : 'background-tile'}
            onClick={() => onSelect(bg.url)}
            aria-label={`Use ${bg.id} background`}
          >
            <img src={bg.url} alt="" />
          </button>
        ))}
      </div>
    </section>
  )
}